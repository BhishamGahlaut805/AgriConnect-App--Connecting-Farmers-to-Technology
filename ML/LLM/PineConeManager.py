import os
import time
import uuid
import shutil
from datetime import datetime, timedelta
from typing import List, Dict, Any
from pinecone import Pinecone, ServerlessSpec   # type:ignore
from langchain_pinecone import PineconeVectorStore      # type:ignore
from langchain_community.embeddings import HuggingFaceEmbeddings    # type:ignore
from langchain.schema import Document   # type:ignore
from langchain_community.document_loaders import PyPDFLoader    # type:ignore
from langchain.text_splitter import RecursiveCharacterTextSplitter  # type:ignore
from .config import logger, PINECONE_INDEXES
from .utils.PDFUtil import save_data_as_pdf

class PineconeManager:
    def __init__(self, api_key: str, default_data_dir: str):
        self.pc = Pinecone(api_key=api_key)
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.vector_stores = {}
        self.data_expiry = timedelta(hours=24)
        self.default_data_dir = default_data_dir

        self._setup_indexes()

    def _setup_indexes(self):
        """Setup all required Pinecone indexes"""
        for index_type, index_name in PINECONE_INDEXES.items():
            try:
                existing_indexes = [i.name for i in self.pc.list_indexes()]

                if index_name not in existing_indexes:
                    logger.info(f"Creating index: {index_name}")
                    self.pc.create_index(
                        name=index_name,
                        dimension=384,
                        metric="cosine",
                        spec=ServerlessSpec(cloud="aws", region="us-east-1")
                    )
                    time.sleep(10)

                self.vector_stores[index_type] = PineconeVectorStore.from_existing_index(
                    index_name=index_name,
                    embedding=self.embeddings
                )
                logger.info(f"Index {index_name} ready for {index_type}")

            except Exception as e:
                logger.error(f"Failed to setup index {index_name}: {e}")

    def _format_timestamp(self, dt: datetime) -> str:
        """Convert datetime to string for Pinecone compatibility"""
        return dt.isoformat()

    def _filter_to_minimal_docs(self, docs: List[Document]) -> List[Document]:
        """Filter documents to minimal metadata"""
        minimal_docs = []
        for doc in docs:
            src = doc.metadata.get("source", "")
            filename = os.path.basename(src) if src else "unknown"
            # Clean page content
            cleaned_content = doc.page_content.strip()
            if cleaned_content:  # Only include non-empty documents
                minimal_docs.append(Document(
                    page_content=cleaned_content,
                    metadata={"source": filename, "page": doc.metadata.get("page", 0)}
                ))
        return minimal_docs

    def _text_split(self, extracted_data: List[Document]) -> List[Document]:
        """Split documents into chunks with optimal settings for agricultural content"""
        if not extracted_data:
            return []

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=50,
            separators=["\n\n", "\n", ". ", "! ", "? ", " ", ""],
            length_function=len
        )
        chunks = splitter.split_documents(extracted_data)
        logger.info(f"Split {len(extracted_data)} documents into {len(chunks)} chunks")
        return chunks

    def add_weather_data(self, weather_data: Dict, location: str):
        """Add weather data to Pinecone with expiry"""
        try:
            # Save to PDF first
            pdf_path = save_data_as_pdf(
                data_type="weather",
                data=weather_data,
                location=location
            )

            document = Document(
                page_content=f"""
                Weather Update for {location}:
                Temperature: {weather_data.get('temperature_avg', 'N/A')}°C
                Humidity: {weather_data.get('humidity_avg', 'N/A')}%
                Location: {location}
                Timestamp: {weather_data.get('timestamp', 'N/A')}
                """,
                metadata={
                    "type": "weather",
                    "location": location,
                    "timestamp": self._format_timestamp(datetime.now()),
                    "expiry": self._format_timestamp(datetime.now() + self.data_expiry),
                    "source": "open-meteo",
                    "pdf_path": pdf_path
                }
            )

            self.vector_stores["weather"].add_documents([document])
            logger.info(f"Weather data added for {location}")

        except Exception as e:
            logger.error(f"Failed to add weather data: {e}")
            raise

    def add_news_data(self, news_items: List[Dict]):
        """Add news data to Pinecone with expiry"""
        try:
            documents = []
            for news in news_items:
                # Save to PDF
                pdf_path = save_data_as_pdf(
                    data_type="news",
                    data=news,
                    source=news.get('source', 'unknown')
                )

                document = Document(
                    page_content=f"""
                    News: {news.get('title', '')}
                    Source: {news.get('source', '')}
                    Summary: {news.get('summary', news.get('title', ''))}
                    Published: {news.get('published_at', '')}
                    """,
                    metadata={
                        "type": "news",
                        "source": news.get('source', ''),
                        "timestamp": self._format_timestamp(datetime.now()),
                        "expiry": self._format_timestamp(datetime.now() + self.data_expiry),
                        "url": news.get('url', ''),
                        "pdf_path": pdf_path
                    }
                )
                documents.append(document)

            self.vector_stores["news"].add_documents(documents)
            logger.info(f"Added {len(news_items)} news items")

        except Exception as e:
            logger.error(f"Failed to add news data: {e}")
            raise

    def add_bulletins_data(self, bulletins: List[Dict]):
        """Add bulletin data to Pinecone"""
        try:
            documents = []
            for bulletin in bulletins:
                # Save to PDF
                pdf_path = save_data_as_pdf(
                    data_type="bulletin",
                    data=bulletin,
                    state=bulletin.get('state', 'unknown')
                )

                document = Document(
                    page_content=f"""
                    Agricultural Bulletin for {bulletin.get('state', '')}:
                    {bulletin.get('content', '')}
                    Source: {bulletin.get('source', 'IMD')}
                    """,
                    metadata={
                        "type": "bulletin",
                        "state": bulletin.get('state', ''),
                        "timestamp": self._format_timestamp(datetime.now()),
                        "expiry": self._format_timestamp(datetime.now() + self.data_expiry),
                        "source": "IMD",
                        "pdf_path": pdf_path
                    }
                )
                documents.append(document)

            self.vector_stores["bulletins"].add_documents(documents)
            logger.info(f"Added {len(bulletins)} bulletins")

        except Exception as e:
            logger.error(f"Failed to add bulletins: {e}")
            raise

    def add_disease_data(self, diseases: List[Dict]):
        """Add disease information to Pinecone"""
        try:
            documents = []
            for disease in diseases:
                # Save to PDF
                pdf_path = save_data_as_pdf(
                    data_type="disease",
                    data=disease,
                    disease_name=disease.get('disease', 'unknown')
                )

                document = Document(
                    page_content=f"""
                    Crop Disease: {disease.get('disease', '')}
                    Affected Crop: {disease.get('crop', '')}
                    Symptoms: {disease.get('symptoms', '')}
                    Treatment: {disease.get('treatment', '')}
                    Prevention: {disease.get('prevention', '')}
                    """,
                    metadata={
                        "type": "disease",
                        "crop": disease.get('crop', ''),
                        "timestamp": self._format_timestamp(datetime.now()),
                        "expiry": self._format_timestamp(datetime.now() + timedelta(days=7)),
                        "source": disease.get('source', 'Agricultural Database'),
                        "pdf_path": pdf_path
                    }
                )
                documents.append(document)

            self.vector_stores["diseases"].add_documents(documents)
            logger.info(f"Added {len(diseases)} disease entries")

        except Exception as e:
            logger.error(f"Failed to add disease data: {e}")
            raise

    def process_and_index_pdf(self, filepath: str, index_type: str, original_filename: str) -> bool:
        """Process PDF file and add to specified Pinecone index"""
        try:
            # Load PDF
            loader = PyPDFLoader(filepath)
            documents = loader.load()

            if not documents:
                logger.error("No content extracted from PDF")
                return False

            # Process documents
            processed_docs = self._filter_to_minimal_docs(documents)
            chunks = self._text_split(processed_docs)

            if not chunks:
                logger.error("No chunks created from PDF")
                return False

            logger.info(f"Created {len(chunks)} chunks from PDF {original_filename}")

            # Add metadata to chunks
            for i, chunk in enumerate(chunks):
                chunk.metadata.update({
                    "source": f"uploaded_pdf_{original_filename}",
                    "upload_type": "admin_upload",
                    "upload_timestamp": datetime.now().isoformat(),
                    "chunk_id": i,
                    "total_chunks": len(chunks),
                    "type": index_type
                })

            # Get the appropriate vector store
            if index_type not in self.vector_stores:
                logger.error(f"Index type {index_type} not found in vector stores")
                return False

            vector_store = self.vector_stores[index_type]

            # Add to Pinecone
            vector_store.add_documents(chunks)

            # Also save a copy to PDF archive
            archive_dir = os.path.join(self.default_data_dir, "pdf_archive", index_type)
            os.makedirs(archive_dir, exist_ok=True)

            archive_filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{original_filename}"
            archive_path = os.path.join(archive_dir, archive_filename)

            # Copy file to archive
            shutil.copy2(filepath, archive_path)

            logger.info(f"PDF archived to: {archive_path}")

            return True

        except Exception as e:
            logger.error(f"PDF processing error: {e}")
            return False

    def get_uploaded_files(self) -> List[Dict]:
        """Get list of uploaded PDF files"""
        try:
            archive_base = os.path.join(self.default_data_dir, "pdf_archive")
            uploaded_files = []

            for index_type in ['weather', 'news', 'diseases', 'bulletins', 'general']:
                index_dir = os.path.join(archive_base, index_type)
                if os.path.exists(index_dir):
                    for filename in os.listdir(index_dir):
                        if filename.endswith('.pdf'):
                            filepath = os.path.join(index_dir, filename)
                            stat = os.stat(filepath)
                            uploaded_files.append({
                                'filename': filename,
                                'index_type': index_type,
                                'upload_time': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                                'size': stat.st_size,
                                'filepath': filepath
                            })

            # Sort by upload time (newest first)
            uploaded_files.sort(key=lambda x: x['upload_time'], reverse=True)
            return uploaded_files

        except Exception as e:
            logger.error(f"Error getting uploaded files: {e}")
            return []

    def delete_uploaded_file(self, filename: str, index_type: str) -> bool:
        """Delete an uploaded PDF file"""
        try:
            filepath = os.path.join(self.default_data_dir, "pdf_archive", index_type, filename)

            if not os.path.exists(filepath):
                logger.error(f"File not found: {filepath}")
                return False

            os.remove(filepath)
            logger.info(f"Deleted uploaded file: {filepath}")
            return True

        except Exception as e:
            logger.error(f"Error deleting file: {e}")
            return False

    def get_retriever(self, index_type: str, search_kwargs: Dict = None):
        """Get retriever for specific index type"""
        if index_type not in self.vector_stores:
            raise ValueError(f"Unknown index type: {index_type}")

        search_kwargs = search_kwargs or {"k": 3}
        return self.vector_stores[index_type].as_retriever(
            search_type="similarity",
            search_kwargs=search_kwargs
        )