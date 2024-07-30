from flask import Flask, request, jsonify
from transformers import pipeline, set_seed

app = Flask(__name__)

model_name = "gpt2"  
generator = pipeline('text-generation', model=model_name, framework='pt')
set_seed(42)  

@app.route('/generate', methods=['POST'])
def generate_text():
    data = request.json
    prompt = data.get('prompt', '')
    max_length = data.get('max_length', 50)
    num_return_sequences = data.get('num_return_sequences', 1)

    try:
        generated_texts = generator(prompt, max_length=max_length, num_return_sequences=num_return_sequences)
        response = {
            "generated_texts": [text['generated_text'] for text in generated_texts]
        }
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
