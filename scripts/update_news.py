import json
import re
import html
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "news-cards.json"

# Free RSS feeds from original publishers
FEEDS = [
    "https://techcrunch.com/category/artificial-intelligence/feed/",
    "https://www.bleepingcomputer.com/feed/",
    "https://feeds.feedburner.com/TheHackersNews",
]

MAX_NEWS = 3
MAX_CARDS = 5
MAX_AGE_DAYS = 14
# Default images for automatically generated news cards.
CATEGORY_IMAGES = {
    "Cybersecurity": (
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b"
        "?auto=format&fit=crop&w=700&q=80"
    ),
    "Artificial Intelligence": (
        "https://images.unsplash.com/photo-1677442136019-21780ecad995"
        "?auto=format&fit=crop&w=700&q=80"
    ),
    "Cloud & Infrastructure": (
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa"
        "?auto=format&fit=crop&w=700&q=80"
    ),
    "Software & Development": (
        "https://images.unsplash.com/photo-1518770660439-4636190af475"
        "?auto=format&fit=crop&w=700&q=80"
    ),
    "Technology & Business": (
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f"
        "?auto=format&fit=crop&w=700&q=80"
    ),
}

def clean_text(value):
    value = html.unescape(value or "")
    return re.sub(r"\s+", " ", value).strip()


def get_child_text(element, names):
    for child in element:
        if child.tag.split("}")[-1].lower() in names:
            if child.text:
                return clean_text(child.text)
            # Atom links often store the URL in an attribute
            href = child.attrib.get("href")
            if href:
                return href
    return ""


def parse_date(value):
    if not value:
        return None
    try:
        result = parsedate_to_datetime(value)
        if result.tzinfo is None:
            result = result.replace(tzinfo=timezone.utc)
        return result.astimezone(timezone.utc)
    except (TypeError, ValueError, OverflowError):
        try:
            result = datetime.fromisoformat(value.replace("Z", "+00:00"))
            if result.tzinfo is None:
                result = result.replace(tzinfo=timezone.utc)
            return result.astimezone(timezone.utc)
        except (TypeError, ValueError):
            return None


def fetch_feed(url):
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "ZeroPointOneNewsBot/1.0"}
    )
    with urllib.request.urlopen(request, timeout=20) as response:
        xml_data = response.read()

    root = ET.fromstring(xml_data)
    entries = [
        element for element in root.iter()
        if element.tag.split("}")[-1].lower() in ("item", "entry")
    ]

    articles = []
    cutoff = datetime.now(timezone.utc) - timedelta(days=MAX_AGE_DAYS)

    for entry in entries:
        title = get_child_text(entry, {"title"})
        link = get_child_text(entry, {"link"})
        published = get_child_text(
            entry, {"pubdate", "published", "updated", "date"}
        )
        publisher = get_child_text(entry, {"source"})

        # RSS feeds can provide a link in an attribute instead of text.
        if not link:
            for child in entry:
                if child.tag.split("}")[-1].lower() == "link":
                    link = child.attrib.get("href", "")
                    if link:
                        break

        if not title or not link:
            continue

        date_value = parse_date(published)
        if date_value and date_value < cutoff:
            continue

        if not publisher:
            channel = next(
                (e for e in root.iter()
                 if e.tag.split("}")[-1].lower() == "channel"),
                None
            )
            if channel is not None:
                publisher = get_child_text(channel, {"title"})

        articles.append({
            "title": title,
            "source_url": link,
            "publisher": publisher or "Original publisher",
            "published_at": (
                date_value.strftime("%d %B %Y") if date_value else ""
            ),
            "_date": date_value or datetime.min.replace(tzinfo=timezone.utc),
        })

    return articles


def categorize(title):
    text = title.lower()

    if any(word in text for word in (
        "security", "cyber", "hack", "breach", "ransomware",
        "malware", "phishing", "vulnerability"
    )):
        return "Cybersecurity"

    if any(word in text for word in (
        "artificial intelligence", " ai ", "ai-powered", "chatgpt",
        "openai", "machine learning", "llm", "generative ai"
    )):
        return "Artificial Intelligence"

    if any(word in text for word in (
        "cloud", "aws", "azure", "google cloud", "server", "outage"
    )):
        return "Cloud & Infrastructure"

    if any(word in text for word in (
        "app", "software", "developer", "website", "platform",
        "android", "ios", "programming"
    )):
        return "Software & Development"

    return "Technology & Business"


def make_problem_solution(category):
    templates = {
        "Cybersecurity": (
            "Businesses need to keep systems, customer data and accounts "
            "protected as security risks evolve.",
            "Review access controls, update software, maintain backups and "
            "create a clear incident-response process."
        ),
        "Artificial Intelligence": (
            "Businesses may struggle to identify where new AI tools can "
            "save time without introducing unnecessary risk.",
            "Start with one measurable workflow, check data privacy and "
            "verify AI-generated results before relying on them."
        ),
        "Cloud & Infrastructure": (
            "Service disruptions and cloud costs can affect business "
            "continuity and application performance.",
            "Monitor availability and costs, document backups and test "
            "recovery procedures regularly."
        ),
        "Software & Development": (
            "Businesses need reliable software that meets user needs and "
            "can be maintained as requirements change.",
            "Define requirements, test key user journeys and use staged "
            "releases with clear ownership."
        ),
        "Technology & Business": (
            "Keeping up with technology changes can make it difficult "
            "to decide what deserves attention first.",
            "Assess the business impact, validate the source and prioritize "
            "changes against measurable goals."
        ),
    }
    return templates.get(category, templates["Technology & Business"])


def main():
    if not DATA_FILE.exists():
        raise FileNotFoundError(
            f"Could not find {DATA_FILE}. Check the existing JSON file path."
        )

    with DATA_FILE.open("r", encoding="utf-8") as file:
        payload = json.load(file)

    if not isinstance(payload, dict) or not isinstance(payload.get("cards"), list):
        raise ValueError(
            "Expected news-cards.json to contain a JSON object with a 'cards' list."
        )

    existing_cards = payload["cards"]
    evergreen_cards = [
        card for card in existing_cards
        if str(card.get("type", "")).lower() != "news"
    ]

    articles = []
    for feed_url in FEEDS:
        try:
            articles.extend(fetch_feed(feed_url))
            print(f"Fetched feed: {feed_url}")
        except Exception as error:
            print(f"Feed unavailable: {feed_url} ({error})")

    # Deduplicate by normalized title and URL.
    unique_articles = []
    seen_titles = set()
    seen_urls = set()

    for article in sorted(
        articles, key=lambda item: item["_date"], reverse=True
    ):
        title_key = re.sub(r"[^a-z0-9]+", "", article["title"].lower())
        url_key = article["source_url"].split("?")[0].rstrip("/")

        if title_key in seen_titles or url_key in seen_urls:
            continue

        seen_titles.add(title_key)
        seen_urls.add(url_key)
        unique_articles.append(article)

    news_cards = []
    for article in unique_articles[:MAX_NEWS]:
        category = categorize(" " + article["title"].lower() + " ")
        problem, solution = make_problem_solution(category)

       
    news_cards.append({
        "type": "news",
        "category": category,
        "title": article["title"],
        "problem": problem,
        "solution": solution,
        "publisher": article["publisher"],
        "published_at": article["published_at"],
        "source_url": article["source_url"],
        "image_url": CATEGORY_IMAGES.get(
            category,
            CATEGORY_IMAGES["Technology & Business"]
        ),
    })

    if not news_cards:
        print("No usable recent articles found. Keeping existing cards.")
        return

    # Keep the existing practical guides and add the latest news.
    # Prioritize news while preserving up to two evergreen cards.
    cards = news_cards + evergreen_cards[:MAX_CARDS - len(news_cards)]
    payload["cards"] = cards[:MAX_CARDS]
    payload["updated_at"] = datetime.now().strftime("%d %B %Y")

    with DATA_FILE.open("w", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=False, indent=2)
        file.write("\n")

    print(
        f"Updated {DATA_FILE.name}: "
        f"{len(news_cards)} news cards and "
        f"{len(payload['cards']) - len(news_cards)} practical guides."
    )


if __name__ == "__main__":
    main()
