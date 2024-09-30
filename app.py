from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from kmeans import KMeans

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "KMeans Clustering API is running. Use the /api/kmeans endpoint for clustering."

@app.route('/api/kmeans', methods=['POST'])
def run_kmeans():
    data = request.json
    X = np.array(data['points'])
    n_clusters = data['n_clusters']
    init_method = data.get('init_method', 'random')
    manual_centroids = data.get('manual_centroids')
    
    kmeans = KMeans(n_clusters=n_clusters, init_method=init_method)
    steps = kmeans.fit(X, manual_centroids)
    
    return jsonify({
        'steps': steps,
        'final_clusters': steps[-1]['clusters'],
        'final_centroids': steps[-1]['centroids']
    })

if __name__ == '__main__':
    app.run(debug=True)