# api.py
from flask import Blueprint, request, jsonify, session
import os
import logging
import json
from dotenv import load_dotenv
from typing import List, Dict, Any, Tuple
from langchain_google_genai import ChatGoogleGenerativeAI   # type:ignore
from langchain.chains import create_retrieval_chain # type:ignore
from langchain.chains.combine_documents import create_stuff_documents_chain # type:ignore
from langchain_core.prompts import ChatPromptTemplate   # type:ignore
from langchain_core.documents import Document   # type:ignore
from langchain_core.retrievers import BaseRetriever # type:ignore
from pymongo import MongoClient
import uuid
from werkzeug.utils import secure_filename
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from .config import logger, MONGO_URI, MONGO_DB
from .PineConeManager import PineconeManager
from .AdminManager import AdminManager

# Load environment variables
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize components
Agribot_bp1 = Blueprint("Agribot", __name__)
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
DEFAULT_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

# Load questionnaire data
QUESTIONNAIRE_PATH = os.path.join(DEFAULT_DATA_DIR, "questionData.json")

def load_questionnaires():
    """Load questionnaire data from JSON file"""
    try:
        if os.path.exists(QUESTIONNAIRE_PATH):
            with open(QUESTIONNAIRE_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            logger.warning(f"Questionnaire file not found at {QUESTIONNAIRE_PATH}")
            return {}
    except Exception as e:
        logger.error(f"Error loading questionnaires: {e}")
        return {}

# Initialize managers
pinecone_manager = PineconeManager(PINECONE_API_KEY, DEFAULT_DATA_DIR)
admin_manager = AdminManager(db, pinecone_manager)
questionnaire_data = load_questionnaires()

# Enhanced Session Context Management
class SessionContextManager:
    def __init__(self):
        self.conversation_history = {}
        self.context_scores = {}

    def get_session_id(self):
        """Get or create session ID"""
        if 'session_id' not in session:
            session['session_id'] = str(uuid.uuid4())
            session['created_at'] = datetime.now().isoformat()
        return session['session_id']

    def add_to_history(self, query: str, response: str, context_types: List[str], top_contexts: List[Tuple[str, float]]):
        """Add query-response pair to session history with context information"""
        session_id = self.get_session_id()
        if session_id not in self.conversation_history:
            self.conversation_history[session_id] = []
            self.context_scores[session_id] = {}

        # Update context scores based on usage
        for context_type, score in top_contexts:
            if context_type not in self.context_scores[session_id]:
                self.context_scores[session_id][context_type] = 0
            self.context_scores[session_id][context_type] += score

        self.conversation_history[session_id].append({
            'query': query,
            'response': response,
            'context_types': context_types,
            'top_contexts': top_contexts,
            'timestamp': datetime.now().isoformat()
        })

        # Keep only last 15 messages to manage memory
        if len(self.conversation_history[session_id]) > 15:
            self.conversation_history[session_id] = self.conversation_history[session_id][-15:]

    def get_conversation_context(self, current_contexts: List[str] = None) -> str:
        """Get enhanced conversation context for current session"""
        session_id = self.get_session_id()
        if session_id not in self.conversation_history or not self.conversation_history[session_id]:
            return ""

        context_lines = ["**Conversation History:**"]

        # Get last 5 messages for context
        recent_messages = self.conversation_history[session_id][-5:]

        for i, msg in enumerate(recent_messages):
            context_lines.append(f"{i+1}. **Q:** {msg['query']}")
            context_lines.append(f"   **A:** {msg['response'][:150]}...")
            if msg['context_types']:
                context_lines.append(f"   **Contexts used:** {', '.join(msg['context_types'])}")
            context_lines.append("")

        # Add session context preferences if available
        if self.context_scores.get(session_id):
            top_contexts = sorted(
                self.context_scores[session_id].items(),
                key=lambda x: x[1],
                reverse=True
            )[:3]
            if top_contexts:
                context_lines.append("**Session Context Preferences:**")
                for ctx, score in top_contexts:
                    context_lines.append(f"- {ctx}: {score:.2f}")
                context_lines.append("")

        return "\n".join(context_lines)

    def get_context_preferences(self) -> List[str]:
        """Get preferred contexts for current session based on history"""
        session_id = self.get_session_id()
        if not self.context_scores.get(session_id):
            return []

        sorted_contexts = sorted(
            self.context_scores[session_id].items(),
            key=lambda x: x[1],
            reverse=True
        )
        return [ctx for ctx, score in sorted_contexts[:2]]

session_manager = SessionContextManager()

# Enhanced NLP-based context determination with questionnaire integration
class AdvancedContextClassifier:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=2000,
            stop_words='english',
            ngram_range=(1, 3),  # Extended to 3-grams for better phrase matching
            min_df=1,
            max_df=0.8,
            sublinear_tf=True  # Use sublinear TF scaling
        )

        # Enhanced context definitions with more specific keywords
        self.context_keywords = {
            'weather': [
                # Core weather terms
                'weather', 'temperature', 'rain', 'humidity', 'forecast', 'climate',
                'monsoon', 'drought', 'flood', 'storm', 'precipitation', 'rainfall',
                'wind', 'sunny', 'cloudy', 'hot', 'cold', 'heat', 'cool', 'season',
                'weather forecast', 'temperature today', 'rain prediction', 'climate suitable',
                'monsoon pattern', 'drought condition', 'flood warning', 'heat wave',
                'cold wave', 'thunderstorm', 'cyclone', 'typhoon', 'barometer',
                'thermometer', 'atmospheric', 'meteorology', 'weather pattern',
                'weather update', 'weather report', 'weather condition',
                # Agricultural weather specific
                'agricultural weather', 'farming weather', 'crop weather', 'seasonal forecast',
                'el nino', 'la nina', 'monsoon prediction', 'rain forecast',
                'temperature forecast', 'humidity level', 'wind speed', 'weather advisory',
                'weather warning', 'weather alert', 'climate change impact'
            ],
            'news': [
                # Core news terms
                'news', 'update', 'latest', 'recent', 'headline', 'breaking',
                'announcement', 'current', 'today', 'happening', 'development',
                'agricultural news', 'farming update', 'market news', 'government announcement',
                'policy update', 'subsidy news', 'technology innovation',
                # News specific patterns
                'latest news', 'recent update', 'current affairs', 'breaking news',
                'today news', 'headline news', 'media report', 'press release',
                'news bulletin', 'news alert', 'news update', 'news development',
                'sector news', 'industry news', 'market update', 'price news',
                'scheme news', 'policy news', 'government news', 'ministry update'
            ],
            'diseases': [
                # Core disease terms
                'disease', 'pest', 'infection', 'symptom', 'blight', 'rust',
                'fungus', 'treatment', 'cure', 'pesticide', 'fungicide',
                'prevention', 'control', 'yellowing', 'wilting', 'spots',
                'crop disease', 'plant infection', 'pest control', 'disease treatment',
                'fungal infection', 'bacterial disease', 'organic pesticide',
                # Disease specific patterns
                'leaf spot', 'root rot', 'stem borer', 'powdery mildew', 'downy mildew',
                'bacterial blight', 'viral disease', 'nematode', 'aphid', 'whitefly',
                'caterpillar', 'locust', 'mite', 'weevil', 'borer insect',
                'plant protection', 'crop health', 'plant doctor', 'disease diagnosis',
                'pest management', 'integrated pest management', 'biological control',
                'chemical control', 'spray schedule', 'disease resistant'
            ],
            'bulletins': [
                # Core bulletin terms
                'bulletin', 'advisory', 'imd', 'report', 'alert', 'warning',
                'guideline', 'recommendation', 'official', 'government',
                'agricultural advisory', 'farming recommendation', 'crop advisory',
                'weather bulletin', 'pest advisory', 'government bulletin',
                # Bulletin specific patterns
                'official bulletin', 'government report', 'imd advisory', 'agriculture department',
                'kvk recommendation', 'extension bulletin', 'research bulletin',
                'technical bulletin', 'scientific report', 'farmer advisory',
                'crop recommendation', 'irrigation advisory', 'soil health advisory',
                'fertilizer recommendation', 'sowing advisory', 'harvest advisory',
                'monsoon advisory', 'drought advisory', 'flood advisory'
            ],
            'general': [
                # Core general farming terms
                'farming', 'agriculture', 'crop', 'cultivation', 'harvest', 'yield',
                'soil', 'fertilizer', 'irrigation', 'seeds', 'planting', 'sowing',
                'organic', 'traditional', 'modern', 'technique', 'method', 'practice',
                'how to', 'what is', 'why', 'when', 'where', 'which', 'explain',
                # General farming specific
                'best practice', 'farming guide', 'agricultural technique', 'crop management',
                'soil management', 'water management', 'nutrient management', 'farm management',
                'sustainable agriculture', 'precision farming', 'smart farming',
                'farm equipment', 'farm machinery', 'agricultural engineering',
                'farm business', 'agricultural economics', 'rural development'
            ]
        }

        # Context priority weights (higher = more specific/important)
        self.context_weights = {
            'diseases': 1.2,    # High priority - specific treatments
            'weather': 1.1,     # High priority - time-sensitive
            'bulletins': 1.0,   # Medium priority - official info
            'news': 0.9,        # Medium priority - updates
            'general': 0.8      # Lower priority - general knowledge
        }

        self.questionnaire_patterns = self._extract_questionnaire_patterns()
        self._fit_enhanced_vectorizer()

    def _extract_questionnaire_patterns(self) -> Dict[str, List[str]]:
        """Extract patterns from questionnaire data with enhanced mapping"""
        patterns = {ctx: [] for ctx in self.context_keywords.keys()}

        if not questionnaire_data:
            return patterns

        try:
            # Enhanced category mapping
            category_mapping = {
                'weather': 'weather',
                'news': 'news',
                'diseases': 'diseases',
                'bulletins': 'bulletins',
                'general': 'general',
                'crop_management': 'general',
                'pest_disease': 'diseases',
                'market_info': 'news',
                'government_schemes': 'bulletins',
                'general_farming': 'general'
            }

            for category, data in questionnaire_data.items():
                context_type = category_mapping.get(category, 'general')
                if isinstance(data, dict) and 'questions' in data:
                    # New structured format
                    patterns[context_type].extend(data['questions'])
                elif isinstance(data, list):
                    # Old list format
                    patterns[context_type].extend(data)
                elif isinstance(data, dict):
                    # Old dict format without 'questions' key
                    for question_text in data.values():
                        if isinstance(question_text, str):
                            patterns[context_type].append(question_text)

        except Exception as e:
            logger.error(f"Error extracting questionnaire patterns: {e}")

        return patterns

    def _fit_enhanced_vectorizer(self):
        """Fit TF-IDF vectorizer with comprehensive training data"""
        sample_texts = []

        # Enhanced training data generation
        for context_type, keywords in self.context_keywords.items():
            # Add multiple variations of keywords
            sample_texts.extend([' '.join(keywords)] * 20)  # Increased samples

            # Add n-gram combinations
            for i in range(len(keywords)):
                if i + 2 <= len(keywords):
                    sample_texts.append(' '.join(keywords[i:i+2]))
                if i + 3 <= len(keywords):
                    sample_texts.append(' '.join(keywords[i:i+3]))

        # Add questionnaire samples with weights
        for context_type, patterns in self.questionnaire_patterns.items():
            if patterns:
                weight = self.context_weights.get(context_type, 1.0)
                sample_texts.extend(patterns * int(15 * weight))  # Weighted samples

        # Add contextual phrases for better discrimination
        contextual_phrases = [
            # Weather specific
            "what is the weather forecast for farming tomorrow",
            "rain prediction for agricultural activities",
            "temperature and humidity for crop growth",
            "monsoon update for sowing preparation",

            # News specific
            "latest agricultural news and developments",
            "recent government announcements for farmers",
            "current market prices and trends",
            "breaking news in farming sector",

            # Diseases specific
            "crop disease identification and treatment",
            "pest control methods for plants",
            "fungal infection symptoms and cure",
            "organic pesticide preparation and use",

            # Bulletins specific
            "government advisory for farmers today",
            "IMD weather bulletin and warnings",
            "official crop recommendations",
            "agriculture department circulars",

            # General specific
            "best farming practices and techniques",
            "soil preparation and fertilization methods",
            "irrigation scheduling for crops",
            "harvesting and post-harvest management"
        ]
        sample_texts.extend(contextual_phrases * 10)

        if sample_texts:
            logger.info(f"Fitting TF-IDF with {len(sample_texts)} training samples")
            self.vectorizer.fit(sample_texts)

    def classify_with_enhanced_tfidf(self, query: str) -> List[Tuple[str, float]]:
        """Enhanced classification with multiple similarity strategies"""
        try:
            query_lower = query.lower().strip()
            query_vec = self.vectorizer.transform([query_lower])

            # Strategy 1: Direct TF-IDF similarity
            tfidf_scores = {}
            for context_type in self.context_keywords.keys():
                # Create comprehensive context representation
                context_texts = []
                context_texts.extend(self.context_keywords[context_type])
                context_texts.extend(self.questionnaire_patterns.get(context_type, []))

                if context_texts:
                    # Use multiple context samples for better representation
                    context_samples = []
                    for i in range(0, min(5, len(context_texts)), 2):
                        context_samples.append(' '.join(context_texts[i:i+3]))

                    if context_samples:
                        context_vectors = self.vectorizer.transform(context_samples)
                        similarities = cosine_similarity(query_vec, context_vectors)[0]
                        max_similarity = max(similarities)
                        tfidf_scores[context_type] = max_similarity

            # Strategy 2: Keyword presence with weights
            keyword_scores = {}
            for context_type, keywords in self.context_keywords.items():
                score = 0
                for keyword in keywords:
                    if ' ' in keyword:  # Multi-word phrase
                        if keyword in query_lower:
                            score += 3.0  # Higher weight for exact phrase match
                    else:  # Single word
                        if keyword in query_lower:
                            score += 1.5  # Good weight for single word

                # Apply context weight
                weight = self.context_weights.get(context_type, 1.0)
                keyword_scores[context_type] = score * weight

            # Strategy 3: Questionnaire pattern matching
            pattern_scores = {}
            for context_type, patterns in self.questionnaire_patterns.items():
                score = 0
                for pattern in patterns:
                    pattern_lower = pattern.lower()
                    # Check for significant word overlap
                    pattern_words = set(pattern_lower.split())
                    query_words = set(query_lower.split())
                    common_words = pattern_words.intersection(query_words)
                    if len(common_words) >= 2:  # At least 2 common words
                        score += len(common_words) * 0.5

                weight = self.context_weights.get(context_type, 1.0)
                pattern_scores[context_type] = score * weight

            # Combine scores with weights
            combined_scores = {}
            max_tfidf = max(tfidf_scores.values()) if tfidf_scores else 1
            max_keyword = max(keyword_scores.values()) if keyword_scores else 1
            max_pattern = max(pattern_scores.values()) if pattern_scores else 1

            for context_type in self.context_keywords.keys():
                tfidf_norm = (tfidf_scores.get(context_type, 0) / max_tfidf) if max_tfidf > 0 else 0
                keyword_norm = (keyword_scores.get(context_type, 0) / max_keyword) if max_keyword > 0 else 0
                pattern_norm = (pattern_scores.get(context_type, 0) / max_pattern) if max_pattern > 0 else 0

                # Weighted combination (TF-IDF most important)
                combined_score = (
                    tfidf_norm * 0.6 +
                    keyword_norm * 0.3 +
                    pattern_norm * 0.1
                )

                # Apply context-specific boost for high-confidence matches
                if keyword_scores.get(context_type, 0) > 3:
                    combined_score *= 1.2

                combined_scores[context_type] = combined_score

            # Get top contexts with minimum threshold
            min_threshold = 0.15  # Lower threshold to catch more cases
            filtered_contexts = [
                (ctx, score) for ctx, score in combined_scores.items()
                if score > min_threshold
            ]

            # Sort by score and take top 2
            top_contexts = sorted(filtered_contexts, key=lambda x: x[1], reverse=True)[:2]

            # If no contexts meet threshold, use fallback
            if not top_contexts:
                return self.classify_with_fallback(query)

            # Ensure we have reasonable score differences
            if len(top_contexts) == 2:
                score_diff = top_contexts[0][1] - top_contexts[1][1]
                if score_diff < 0.1:  # Scores too close, might need re-evaluation
                    # Re-evaluate with more strict criteria
                    return self._reevaluate_close_scores(query, top_contexts)

            logger.info(f"Query: '{query}' -> Contexts: {top_contexts} "
                       f"[TF-IDF: {tfidf_scores}, Keywords: {keyword_scores}]")

            return top_contexts

        except Exception as e:
            logger.error(f"Enhanced TF-IDF classification failed: {e}")
            return self.classify_with_fallback(query)

    def _reevaluate_close_scores(self, query: str, top_contexts: List[Tuple[str, float]]) -> List[Tuple[str, float]]:
        """Re-evaluate when top contexts have very close scores"""
        query_lower = query.lower()

        # Check for specific strong indicators
        strong_indicators = {
            'diseases': ['treatment', 'cure', 'symptom', 'pesticide', 'fungicide', 'infected'],
            'weather': ['forecast', 'temperature', 'rainfall', 'monsoon', 'humidity', 'storm'],
            'news': ['latest', 'breaking', 'update', 'announcement', 'recent', 'today'],
            'bulletins': ['advisory', 'warning', 'alert', 'government', 'official', 'imd'],
            'general': ['how to', 'what is', 'best way', 'method', 'technique']
        }

        context_scores = {ctx: score for ctx, score in top_contexts}

        # Boost scores based on strong indicators
        for context_type, indicators in strong_indicators.items():
            for indicator in indicators:
                if indicator in query_lower:
                    if context_type in context_scores:
                        context_scores[context_type] += 0.2
                    elif len(context_scores) < 2:
                        context_scores[context_type] = 0.3

        # Return updated top contexts
        return sorted(context_scores.items(), key=lambda x: x[1], reverse=True)[:2]

    def classify_with_fallback(self, query: str) -> List[Tuple[str, float]]:
        """Comprehensive fallback classification"""
        query_lower = query.lower()

        # Multiple fallback strategies
        strategies = []

        # Strategy 1: Enhanced keyword matching
        keyword_scores = {ctx: 0 for ctx in self.context_keywords.keys()}
        for context_type, keywords in self.context_keywords.items():
            for keyword in keywords:
                if ' ' in keyword:  # Phrase match
                    if keyword in query_lower:
                        keyword_scores[context_type] += 3.0
                else:  # Word match
                    if keyword in query_lower:
                        keyword_scores[context_type] += 1.5

        strategies.append(keyword_scores)

        # Strategy 2: Question pattern analysis
        pattern_scores = {ctx: 0 for ctx in self.context_keywords.keys()}
        question_patterns = {
            'diseases': ['what is wrong with', 'why are my', 'how to treat', 'symptom of'],
            'weather': ['will it rain', 'temperature today', 'weather tomorrow', 'humidity level'],
            'news': ['latest news', 'recent update', 'what happened', 'breaking news'],
            'bulletins': ['government advisory', 'official report', 'imd bulletin', 'warning'],
            'general': ['how to', 'what is', 'best way to', 'method for']
        }

        for context_type, patterns in question_patterns.items():
            for pattern in patterns:
                if pattern in query_lower:
                    pattern_scores[context_type] += 2.0

        strategies.append(pattern_scores)

        # Strategy 3: Word frequency analysis
        word_scores = {ctx: 0 for ctx in self.context_keywords.keys()}
        query_words = set(query_lower.split())
        for context_type, keywords in self.context_keywords.items():
            context_words = set()
            for keyword in keywords:
                context_words.update(keyword.split())
            common_words = query_words.intersection(context_words)
            word_scores[context_type] = len(common_words) * 0.8

        strategies.append(word_scores)

        # Combine strategies
        combined_scores = {}
        for context_type in self.context_keywords.keys():
            total_score = sum(strategy.get(context_type, 0) for strategy in strategies)
            # Apply context weight
            weight = self.context_weights.get(context_type, 1.0)
            combined_scores[context_type] = total_score * weight

        # Normalize and get top 2
        max_score = max(combined_scores.values()) if combined_scores else 1
        normalized_scores = {
            ctx: (score / max_score) for ctx, score in combined_scores.items()
        }

        top_contexts = sorted(
            normalized_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )[:2]

        # Filter by minimum confidence
        return [(ctx, score) for ctx, score in top_contexts if score > 0.1]

context_classifier = AdvancedContextClassifier()

def determine_top_contexts(query: str) -> List[Tuple[str, float]]:
    """Determine top 2 context types for a query"""
    return context_classifier.classify_with_enhanced_tfidf(query)

# Enhanced system prompt with multi-context support
system_prompt = """You are an expert agriculture assistant with access to multiple specialized knowledge sources.

CONVERSATION CONTEXT:
{conversation_context}

AVAILABLE DOCUMENTS FROM RELEVANT SOURCES:
{context}

USER QUESTION: {input}

SELECTED KNOWLEDGE DOMAINS: {selected_contexts}

CRITICAL GUIDELINES:
1. Synthesize information from all available relevant sources
2. Maintain conversation continuity and reference previous discussions when relevant
3. For weather-related aspects, use weather data
4. For recent developments, use news sources
5. For disease/pest issues, use disease database
6. For official recommendations, use bulletin data
7. Format responses with clear headings and bullet points for readability
8. Acknowledge when information is limited and suggest expert consultation
9. Cite specific sources when referencing particular data points
10. Integrate information seamlessly rather than separating by source

Provide a comprehensive, well-structured response that addresses all aspects of the question:"""

# Start background service
admin_manager.start_auto_scraping()

# Allowed extensions
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# FIXED: Proper MultiContextRetriever implementation
class MultiContextRetriever(BaseRetriever):
    """Proper implementation of multi-context retriever"""

    def __init__(self, documents: List[Document]):
        super().__init__()
        self._documents = documents

    def _get_relevant_documents(self, query: str, **kwargs) -> List[Document]:
        return self._documents

    async def _aget_relevant_documents(self, query: str, **kwargs) -> List[Document]:
        return self._documents

@Agribot_bp1.route("/chat", methods=["GET", "POST"])
def chat():
    """Enhanced chat endpoint with multi-index retrieval and session context"""
    try:
        # Get message
        if request.method == "POST":
            msg = request.form.get("msg", "").strip()
        else:
            msg = request.args.get("msg", "").strip()

        if not msg:
            return jsonify({"error": "Please provide a question"}), 400

        logger.info(f"Processing query: {msg}")

        # Determine top 2 context types using enhanced NLP
        top_contexts = determine_top_contexts(msg)
        context_types = [ctx for ctx, score in top_contexts]

        # Add session context preferences if available
        session_preferences = session_manager.get_context_preferences()
        if session_preferences and len(context_types) < 2:
            for pref_ctx in session_preferences:
                if pref_ctx not in context_types and len(context_types) < 2:
                    context_types.append(pref_ctx)

        # Ensure we have at least one context
        if not context_types:
            context_types = ['general']

        logger.info(f"Query: '{msg}' -> Selected contexts: {context_types} with scores: {[score for _, score in top_contexts]}")

        # Get retrievers for all selected contexts
        all_documents = []

        # ALWAYS include general index for comprehensive coverage
        if 'general' not in context_types:
            context_types.append('general')

        for context_type in context_types:
            try:
                retriever = pinecone_manager.get_retriever(context_type)
                documents = retriever.get_relevant_documents(msg)
                # Add context metadata to documents
                for doc in documents:
                    doc.metadata['source_context'] = context_type
                all_documents.extend(documents)
                logger.info(f"Retrieved {len(documents)} documents from {context_type} index")
            except Exception as e:
                logger.warning(f"Failed to retrieve from {context_type}: {e}")
                continue

        # If we have very few documents from specialized contexts, prioritize general
        specialized_docs = [doc for doc in all_documents if doc.metadata.get('source_context') != 'general']
        general_docs = [doc for doc in all_documents if doc.metadata.get('source_context') == 'general']

        # If specialized contexts returned few results but general has many, boost general
        if len(specialized_docs) < 3 and len(general_docs) > 5:
            logger.info(f"Boosting general index results: {len(general_docs)} documents available")
            # Keep all general docs and top specialized docs
            all_documents = general_docs + specialized_docs[:2]

        # Get conversation context
        conversation_context = session_manager.get_conversation_context(context_types)

        # Initialize LLM
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",
            google_api_key=GEMINI_API_KEY,
            temperature=0.3,
            max_output_tokens=1500
        )

        # Create RAG chain with enhanced prompt
        prompt_template = ChatPromptTemplate.from_template(system_prompt)
        question_answer_chain = create_stuff_documents_chain(
            llm, prompt_template, document_variable_name="context"
        )

        # FIXED: Use proper BaseRetriever implementation
        multi_retriever = MultiContextRetriever(all_documents)
        rag_chain = create_retrieval_chain(multi_retriever, question_answer_chain)

        # Get response with enhanced context
        response = rag_chain.invoke({
            "input": msg,
            "conversation_context": conversation_context,
            "selected_contexts": ", ".join(context_types)
        })
        answer = response.get("answer", "").strip()

        # Store in session history with context information
        session_manager.add_to_history(msg, answer, context_types, top_contexts)

        return _format_enhanced_response(answer, context_types, top_contexts)

    except Exception as e:
        logger.error(f"Chat error: {e}")
        return jsonify({"error": f"Service temporarily unavailable: {str(e)}"}), 500

def _format_enhanced_response(answer: str, context_types: List[str], top_contexts: List[Tuple[str, float]]) -> str:
    """Format enhanced response showing used contexts"""
    if not answer or "i don't have specific information" in answer.lower():
        return "🌱 **Information Not Available**\n\nI don't have specific information about this in my knowledge base. Please consult with local agricultural experts for detailed guidance."

    # Context icons and headers
    context_headers = {
        "weather": "🌤️ Weather Information",
        "news": "📰 Agricultural News",
        "diseases": "🦠 Crop Health",
        "bulletins": "📋 Official Advisories",
        "general": "🌾 Farming Insights"
    }

    # Build header with context information
    header_parts = []
    for context_type in context_types:
        header_parts.append(context_headers.get(context_type, "🌾 General Agriculture"))

    main_header = " • ".join(header_parts)

    # Add context confidence information
    confidence_info = ""
    if top_contexts:
        conf_items = [f"{ctx}({score:.2f})" for ctx, score in top_contexts]
        confidence_info = f"\n\n🔍 *Sources: {', '.join(conf_items)}*"

    return f"**{main_header}**{confidence_info}\n\n{answer}"

# ================= ENHANCED ADMIN ROUTES =================

@Agribot_bp1.route("/admin/context-analysis", methods=["POST"])
def analyze_context():
    """Analyze query context classification"""
    try:
        data = request.get_json()
        query = data.get('query', '')

        if not query:
            return jsonify({"error": "Query required"}), 400

        top_contexts = determine_top_contexts(query)
        questionnaire_count = len(context_classifier.questionnaire_patterns)

        return jsonify({
            "status": "success",
            "query": query,
            "top_contexts": top_contexts,
            "questionnaire_patterns_loaded": questionnaire_count,
            "all_contexts": list(context_classifier.context_keywords.keys())
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@Agribot_bp1.route("/admin/reload-questionnaires", methods=["POST"])
def reload_questionnaires():
    """Reload questionnaire data"""
    try:
        global questionnaire_data, context_classifier
        questionnaire_data = load_questionnaires()
        context_classifier = AdvancedContextClassifier()  # Reinitialize with new data

        return jsonify({
            "status": "success",
            "message": "Questionnaires reloaded successfully",
            "patterns_loaded": len(questionnaire_data)
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ================= SESSION MANAGEMENT ROUTES =================

@Agribot_bp1.route("/session/clear", methods=["POST"])
def clear_session():
    """Clear current session history"""
    try:
        session_id = session_manager.get_session_id()
        if session_id in session_manager.conversation_history:
            del session_manager.conversation_history[session_id]
        if session_id in session_manager.context_scores:
            del session_manager.context_scores[session_id]
        session.clear()
        return jsonify({"status": "success", "message": "Session cleared"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@Agribot_bp1.route("/session/history", methods=["GET"])
def get_session_history():
    """Get current session history with context analysis"""
    try:
        session_id = session_manager.get_session_id()
        history = session_manager.conversation_history.get(session_id, [])
        preferences = session_manager.context_scores.get(session_id, {})

        return jsonify({
            "status": "success",
            "session_id": session_id,
            "history": history,
            "context_preferences": preferences,
            "total_messages": len(history)
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@Agribot_bp1.route("/session/contexts", methods=["GET"])
def get_session_contexts():
    """Get context usage statistics for current session"""
    try:
        session_id = session_manager.get_session_id()
        preferences = session_manager.context_scores.get(session_id, {})

        return jsonify({
            "status": "success",
            "session_id": session_id,
            "context_usage": preferences,
            "top_contexts": session_manager.get_context_preferences()
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ================= HEALTH AND ADMIN ROUTES =================


@Agribot_bp1.route("/admin/status", methods=["GET"])
def admin_status():
    """Admin endpoint to check scraping status"""
    try:
        status = admin_manager.get_scraping_status()
        return jsonify({
            "status": "success",
            "data": status
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@Agribot_bp1.route("/admin/scrape/weather", methods=["POST"])
def admin_scrape_weather():
    """Admin endpoint to force weather scraping"""
    try:
        data = request.get_json() or {}
        locations = data.get('locations')

        count = admin_manager.scrape_weather_data(locations)
        return jsonify({
            "status": "success",
            "message": f"Weather scraping completed",
            "locations_processed": count
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@Agribot_bp1.route("/admin/scrape/news", methods=["POST"])
def admin_scrape_news():
    """Admin endpoint to force news scraping"""
    try:
        count = admin_manager.scrape_news_data()
        return jsonify({
            "status": "success",
            "message": f"News scraping completed",
            "news_items_processed": count
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@Agribot_bp1.route("/admin/scrape/bulletins", methods=["POST"])
def admin_scrape_bulletins():
    """Admin endpoint to force bulletin scraping"""
    try:
        data = request.get_json() or {}
        states = data.get('states', ["Haryana", "Delhi", "Uttar Pradesh"])

        count = admin_manager.scrape_bulletins()
        return jsonify({
            "status": "success",
            "message": f"Bulletin scraping completed",
            "states_processed": count
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@Agribot_bp1.route("/admin/scrape/diseases", methods=["POST"])
def admin_scrape_diseases():
    """Admin endpoint to force disease info scraping"""
    try:
        count = admin_manager.scrape_disease_info()
        return jsonify({
            "status": "success",
            "message": f"Disease information updated",
            "disease_entries_processed": count
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@Agribot_bp1.route("/admin/scrape/all", methods=["POST"])
def admin_scrape_all():
    """Admin endpoint to scrape all data types"""
    try:
        results = {
            "weather": admin_manager.scrape_weather_data(),
            "news": admin_manager.scrape_news_data(),
            "bulletins": admin_manager.scrape_bulletins(),
            "diseases": admin_manager.scrape_disease_info()
        }

        return jsonify({
            "status": "success",
            "message": "Complete scraping cycle completed",
            "results": results
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@Agribot_bp1.route("/admin/upload-pdf", methods=["POST"])
def admin_upload_pdf():
    """Admin endpoint to upload PDF to specific Pinecone index"""
    try:
        # Check if files are present
        if 'file' not in request.files:
            return jsonify({
                "status": "error",
                "message": "No file provided"
            }), 400

        file = request.files['file']
        index_type = request.form.get('index_type', 'general')

        # Validate file
        if file.filename == '':
            return jsonify({
                "status": "error",
                "message": "No file selected"
            }), 400

        if not allowed_file(file.filename):
            return jsonify({
                "status": "error",
                "message": "Only PDF files are allowed"
            }), 400

        # Validate index type
        allowed_indexes = ['weather', 'news', 'diseases', 'bulletins', 'general']
        if index_type not in allowed_indexes:
            return jsonify({
                "status": "error",
                "message": f"Invalid index type. Allowed: {', '.join(allowed_indexes)}"
            }), 400

        # Save file temporarily
        upload_dir = os.path.join(DEFAULT_DATA_DIR, "temp_uploads")
        os.makedirs(upload_dir, exist_ok=True)

        unique_filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
        temp_filepath = os.path.join(upload_dir, unique_filename)
        file.save(temp_filepath)

        # Process PDF and add to Pinecone using PineconeManager
        success = pinecone_manager.process_and_index_pdf(temp_filepath, index_type, file.filename)

        # Clean up temp file
        try:
            os.remove(temp_filepath)
        except:
            pass

        if success:
            logger.info(f"PDF {file.filename} successfully added to {index_type} index")
            return jsonify({
                "status": "success",
                "message": f"PDF successfully uploaded and indexed in {index_type}",
                "filename": file.filename,
                "index_type": index_type,
                "timestamp": datetime.now().isoformat()
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Failed to process and index PDF"
            }), 500

    except Exception as e:
        logger.error(f"PDF upload error: {e}")
        return jsonify({
            "status": "error",
            "message": f"Upload failed: {str(e)}"
        }), 500

@Agribot_bp1.route("/admin/uploaded-files", methods=["GET"])
def get_uploaded_files():
    """Get list of uploaded PDF files"""
    try:
        uploaded_files = pinecone_manager.get_uploaded_files()

        return jsonify({
            "status": "success",
            "files": uploaded_files,
            "total_count": len(uploaded_files)
        })

    except Exception as e:
        logger.error(f"Error getting uploaded files: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@Agribot_bp1.route("/admin/delete-uploaded-file", methods=["DELETE"])
def delete_uploaded_file():
    """Delete an uploaded PDF file"""
    try:
        data = request.get_json()
        filename = data.get('filename')
        index_type = data.get('index_type')

        if not filename or not index_type:
            return jsonify({
                "status": "error",
                "message": "Filename and index_type are required"
            }), 400

        success = pinecone_manager.delete_uploaded_file(filename, index_type)

        if success:
            return jsonify({
                "status": "success",
                "message": f"File {filename} deleted successfully"
            })
        else:
            return jsonify({
                "status": "error",
                "message": "File not found or could not be deleted"
            }), 404

    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@Agribot_bp1.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    try:
        return jsonify({
            "status": "healthy",
            "indexes_ready": list(pinecone_manager.vector_stores.keys()),
            "scraping_service_running": admin_manager.is_running
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
