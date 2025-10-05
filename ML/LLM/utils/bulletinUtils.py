# bulletinUtils.py
import requests
from bs4 import BeautifulSoup   # type:ignore
from datetime import datetime
import io
import base64
from ..config import logger

def fetch_imd_agromet_bulletin(state: str):
    """Fetch IMD Agromet Advisory Bulletin - return PDF content as-is for indexing"""
    try:
        url = f"https://imdagrimet.gov.in/Services/StateBulletin.php?language=English&state={state}"

        response = requests.get(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }, timeout=15)
        response.raise_for_status()

        # Check if response is PDF
        if response.headers.get('content-type') == 'application/pdf' or url.endswith('.pdf'):
            # Return PDF content as base64 for proper indexing by PineconeManager
            pdf_content_base64 = base64.b64encode(response.content).decode('utf-8')

            return {
                'state': state,
                'content': f"PDF Bulletin for {state} - Available for download",
                'pdf_content': pdf_content_base64,  # Store actual PDF content
                'download_links': [{
                    'text': f'IMD Bulletin for {state}',
                    'url': url
                }],
                'source': 'IMD',
                'fetched_at': datetime.now(),
                'url': url,
                'content_type': 'pdf',
                'file_size': len(response.content),
                'file_name': f"imd_bulletin_{state.lower().replace(' ', '_')}.pdf"
            }
        else:
            # Fallback to HTML parsing if not PDF
            soup = BeautifulSoup(response.text, "html.parser")

            # Look for PDF links
            download_links = []
            for link in soup.find_all("a", href=True):
                href = link['href']
                if href.endswith('.pdf'):
                    download_links.append({
                        'text': link.get_text(strip=True),
                        'url': href if href.startswith('http') else f"https://imdagrimet.gov.in{href}"
                    })

            # If PDF links found, fetch the first PDF
            if download_links:
                pdf_response = requests.get(download_links[0]['url'], headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }, timeout=15)
                pdf_response.raise_for_status()

                # Return PDF content as base64
                pdf_content_base64 = base64.b64encode(pdf_response.content).decode('utf-8')

                return {
                    'state': state,
                    'content': f"PDF Bulletin for {state} - Available for download",
                    'pdf_content': pdf_content_base64,
                    'download_links': download_links,
                    'source': 'IMD',
                    'fetched_at': datetime.now(),
                    'url': download_links[0]['url'],
                    'content_type': 'pdf',
                    'file_size': len(pdf_response.content),
                    'file_name': f"imd_bulletin_{state.lower().replace(' ', '_')}.pdf"
                }
            else:
                # Fallback to HTML content extraction
                content_div = soup.find("div", class_="bulletin-content")
                if content_div:
                    content = content_div.get_text(separator="\n", strip=True)
                else:
                    content = f"Agromet Advisory Bulletin for {state}"

                return {
                    'state': state,
                    'content': content[:1000],
                    'download_links': download_links,
                    'source': 'IMD',
                    'fetched_at': datetime.now(),
                    'url': url,
                    'content_type': 'html'
                }

    except requests.RequestException as e:
        logger.error(f"Bulletin fetch failed for {state}: {e}")
        return None

