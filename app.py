from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
import re

app = Flask(__name__)
CORS(app)

# Configure Gemini API
genai.configure(api_key="YOUR_API_KEY")  # Replace with your actual Gemini API key
model = genai.GenerativeModel('gemini-1.5-pro')

def summarize_text(text):
    """Generate a summary of the input text with key points and concepts."""
    prompt = (
        f"Summarize the following text into 3-5 concise cards. Each card should have a clear title and "
        f"2-3 key points with brief explanations. Format the output as valid JSON with this structure:\n\n"
        f"{{\"cards\": [\n"
        f"  {{\"title\": \"Card Title 1\", \"points\": [\n"
        f"    {{\"concept\": \"Key Concept 1\", \"explanation\": \"Explanation of concept 1\"}},\n"
        f"    {{\"concept\": \"Key Concept 2\", \"explanation\": \"Explanation of concept 2\"}}\n"
        f"  ]}},\n"
        f"  {{\"title\": \"Card Title 2\", \"points\": [\n"
        f"    {{\"concept\": \"Key Concept 1\", \"explanation\": \"Explanation of concept 1\"}},\n"
        f"    {{\"concept\": \"Key Concept 2\", \"explanation\": \"Explanation of concept 2\"}}\n"
        f"  ]}}\n"
        f"]}}\n\n"
        f"IMPORTANT: Do NOT create question-answer pairs. Create informative summary cards with factual statements only. "
        f"Make sure to escape any special characters in the JSON. The output must be valid JSON that can be parsed. "
        f"Do not include any text outside the JSON structure.\n\n"
        f"Text to summarize: {text}"
    )
    
    try:
        response = model.generate_content(prompt)
        if response.candidates and len(response.candidates) > 0:
            raw_summary = response.candidates[0].content.parts[0].text
            return process_summary(raw_summary)
        else:
            return {"error": "No summary generated"}
    except Exception as e:
        print(f"Error in summarize_text: {str(e)}")
        return {"error": str(e)}

def extract_json_from_text(text):
    """Extract JSON object from text that might contain markdown code blocks or other text."""
    # Try to find JSON in code blocks
    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if json_match:
        return json_match.group(1).strip()
    
    # Look for JSON object pattern
    json_match = re.search(r'({[\s\S]*})', text)
    if json_match:
        return json_match.group(1).strip()
    
    return text.strip()

def process_summary(raw_summary):
    """Process the raw summary into cards structure."""
    print(f"Raw summary from AI: {raw_summary}")
    try:
        # Try to extract JSON from the text
        json_str = extract_json_from_text(raw_summary)
        print(f"Extracted JSON string: {json_str}")
        
        # Try to parse the JSON
        data = json.loads(json_str)
        
        # Validate the structure
        if "cards" in data and isinstance(data["cards"], list):
            # Ensure each card has the right structure
            for card in data["cards"]:
                if "title" not in card:
                    card["title"] = "Untitled Card"
                if "points" not in card or not isinstance(card["points"], list):
                    card["points"] = []
                
                # Ensure each point has concept and explanation
                for point in card["points"]:
                    if "concept" not in point:
                        point["concept"] = "Key Point"
                    if "explanation" not in point:
                        point["explanation"] = ""
            
            return data
    except Exception as e:
        print(f"Failed to parse JSON: {str(e)}")
        # Fall back to manual parsing
    
    # If JSON parsing fails, try to structure it manually
    try:
        cards = []
        current_card = None
        current_point = None
        
        lines = raw_summary.strip().split('\n')
        for line in lines:
            line = line.strip()
            
            # Skip empty lines
            if not line:
                continue
                
            # Check for card header (usually with "Card" in it or numbered)
            if line.lower().startswith(("card", "#", "1.", "2.", "3.", "4.", "5.")):
                if current_card and "points" in current_card and current_card["points"]:
                    cards.append(current_card)
                
                # Extract title from the line
                title = line.split(":", 1)[1].strip() if ":" in line else line
                # Clean up the title
                for prefix in ["card", "#", "1.", "2.", "3.", "4.", "5."]:
                    title = title.lower().replace(prefix.lower(), "", 1).strip()
                
                current_card = {"title": title, "points": []}
                current_point = None
            
            # Check for point/bullet
            elif line.startswith(("- ", "* ", "•")) or (line.startswith(("a.", "b.", "c.")) and current_card):
                if current_point:
                    current_card["points"].append(current_point)
                
                point_text = line[2:].strip() if line.startswith(("- ", "* ", "•")) else line[2:].strip()
                
                # Handle cases where concept and explanation are on the same line
                if ":" in point_text:
                    concept, explanation = point_text.split(":", 1)
                    current_point = {"concept": concept.strip(), "explanation": explanation.strip()}
                else:
                    current_point = {"concept": point_text, "explanation": ""}
            
            # Description continuation
            elif current_point and current_card:
                current_point["explanation"] += " " + line
        
        # Add the last point if it exists
        if current_point and current_card:
            current_card["points"].append(current_point)
        
        # Add the last card if it exists
        if current_card and "points" in current_card and current_card["points"]:
            cards.append(current_card)
        
        # If no cards were detected using the structure approach, create a single card with all content
        if not cards:
            cards = [{
                "title": "Summary",
                "points": parse_unstructured_content(raw_summary)
            }]
        
        return {"cards": cards}
    except Exception as e:
        print(f"Error in manual parsing: {str(e)}")
        # Final fallback - just create a simple summary card
        return {"cards": [{"title": "Summary", "points": parse_unstructured_content(raw_summary)}]}

def parse_unstructured_content(text):
    """Parse unstructured content into points."""
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    points = []
    
    for i, paragraph in enumerate(paragraphs[:5]):  # Limit to first 5 paragraphs
        sentences = paragraph.split('. ')
        concept = sentences[0]
        explanation = '. '.join(sentences[1:]) if len(sentences) > 1 else ""
        
        points.append({
            "concept": concept,
            "explanation": explanation
        })
    
    return points

@app.route('/api/summarize', methods=['POST'])
def summarize_content():
    data = request.get_json()
    content = data.get('content', '')
    
    if not content:
        return jsonify({'error': 'No content provided'}), 400
    
    try:
        summary = summarize_text(content)
        if "error" in summary:
            return jsonify({'error': summary["error"]}), 500
        
        # Ensure proper content type
        return jsonify(summary), 200, {'Content-Type': 'application/json'}
    except Exception as e:
        print(f"Error in API handler: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/ask', methods=['POST'])
def ask_question():
    data = request.get_json()
    question = data.get('question', '')
    print(f"Received question: {question}")  # Debug log

    if not question:
        return jsonify({'error': 'No question provided'}), 400

    try:
        response = model.generate_content(question)
        print("Full response from Gemini API:", response)  # Debug log
        print("Response candidates:", response.candidates)  # Debug log
        # Check if candidates exist and extract the text
        if response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if candidate.content and candidate.content.parts and len(candidate.content.parts) > 0:
                answer = candidate.content.parts[0].text
            else:
                answer = "No answer content available."
        else:
            answer = "No candidates available in the response."
        print(f"Answer: {answer}")  # Debug log
        return jsonify({'answer': answer})
    except Exception as e:
        print(f"Error: {str(e)}")  # Debug log
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
