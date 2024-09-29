.PHONY: install run clean

install:
	npm install
	pip install -r requirements.txt

run:
	npm start & python app.py

clean:
	rm -rf node_modules
	rm -rf venv