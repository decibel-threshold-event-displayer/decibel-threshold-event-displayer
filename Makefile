.PHONY: dev
dev:
	python3 -m http.server -d app

.PHONY: report
doc-report:
	cd ./doc/report && pdflatex --shell-escape report.tex

.PHONY: docs
docs:
	doc-report
