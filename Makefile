.PHONY: dev backend app bot test diagrams

dev: backend

backend:
	uvicorn backend.main:app --reload

app:
	cd app && npm run dev

bot:
	cd bot && python main.py

test:
	python -m pytest backend/tests -q
	cd app && npm run test --silent || true

diagrams:
	cd diagrams && for f in *.mmd; do npx -y @mermaid-js/mermaid-cli -i "$$f" -o "exported/$${f%.mmd}.svg"; done
