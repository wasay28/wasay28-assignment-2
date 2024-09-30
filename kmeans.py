import numpy as np

class KMeans:
    def __init__(self, n_clusters, init_method='random', max_iter=100):
        self.n_clusters = n_clusters
        self.init_method = init_method
        self.max_iter = max_iter
        self.centroids = None

    def fit(self, X, manual_centroids=None):
        if self.init_method == 'manual' and manual_centroids is not None:
            self.centroids = np.array(manual_centroids)
        else:
            self.centroids = self._init_centroids(X)
        
        steps = []
        for _ in range(self.max_iter):
            old_centroids = self.centroids.copy()
            clusters = self._assign_clusters(X)
            steps.append({'centroids': self.centroids.tolist(), 'clusters': clusters.tolist()})
            
            self.centroids = self._update_centroids(X, clusters)
            if np.all(old_centroids == self.centroids):
                break
        
        return steps

    def _init_centroids(self, X):
        if self.init_method == 'random':
            return X[np.random.choice(X.shape[0], self.n_clusters, replace=False)]
        elif self.init_method == 'farthest_first':
            centroids = [X[np.random.choice(X.shape[0])]]
            for _ in range(1, self.n_clusters):
                dist = np.min([np.sum((X - c) ** 2, axis=1) for c in centroids], axis=0)
                centroids.append(X[np.argmax(dist)])
            return np.array(centroids)
        elif self.init_method == 'kmeans++':
            centroids = [X[np.random.choice(X.shape[0])]]
            for _ in range(1, self.n_clusters):
                dist = np.min([np.sum((X - c) ** 2, axis=1) for c in centroids], axis=0)
                probs = dist / dist.sum()
                cumprobs = probs.cumsum()
                r = np.random.random()
                centroids.append(X[np.searchsorted(cumprobs, r)])
            return np.array(centroids)

    def _assign_clusters(self, X):
        distances = np.sqrt(((X - self.centroids[:, np.newaxis])**2).sum(axis=2))
        return np.argmin(distances, axis=0)

    def _update_centroids(self, X, clusters):
        return np.array([X[clusters == k].mean(axis=0) for k in range(self.n_clusters)])