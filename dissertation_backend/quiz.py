import pandas as pd
import pickle
from flask import *
from flask_cors import CORS
import json




def load_models(filename='trained_models.pkl'):
    with open(filename, 'rb') as f:
        data = pickle.load(f)
    return data['science_model'], data['math_model'], data['features']

def predict_new_input(science_model, math_model, new_input_data, features):
    new_input_df = pd.DataFrame([new_input_data])

    new_input_df = new_input_df[features]

    predicted_science_score = science_model.predict(new_input_df)[0]
    predicted_math_score = math_model.predict(new_input_df)[0]

    return predicted_science_score, predicted_math_score

loaded_science_model, loaded_math_model, loaded_features = load_models('trained_models.pkl')

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods = ['POST'])
def predict():

    data = request.get_json()
    predicted_science_score, predicted_math_score = predict_new_input(loaded_science_model, loaded_math_model, data, loaded_features)

    predicted_science_score = float(predicted_science_score)
    predicted_math_score = float(predicted_math_score)

    return jsonify({
        "predicted_science_score": predicted_science_score,
        "predicted_math_score": predicted_math_score
    })


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug = True)
