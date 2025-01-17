.PHONY: dev
dev:
	python -m http.server -d app || python3 -m http.server -d app

./doc/report/report.pdf: ./doc/report/report.tex
	cd ./doc/report \
	&& pdflatex --shell-escape report.tex \
	&& bibtex report \
	&& pdflatex --shell-escape report.tex \
	&& pdflatex --shell-escape report.tex

./doc/scrum_report/scrum_report.pdf: ./doc/scrum_report/scrum_report.tex
	cd ./doc/scrum_report \
	&& pdflatex --shell-escape scrum_report.tex \
	&& bibtex scrum_report \
	&& pdflatex --shell-escape scrum_report.tex \
	&& pdflatex --shell-escape scrum_report.tex

./doc/intermediate_presentation/intermediate_presentation.pdf: ./doc/intermediate_presentation/intermediate_presentation.tex
	cd ./doc/intermediate_presentation \
	&& pdflatex --shell-escape intermediate_presentation.tex \
	&& pdflatex --shell-escape intermediate_presentation.tex

./doc/presentation/presentation.pdf: ./doc/presentation/presentation.tex
	cd ./doc/presentation \
	&& pdflatex --shell-escape presentation.tex \
	&& pdflatex --shell-escape presentation.tex

.PHONY: docs
docs: ./doc/report/report.pdf \
		./doc/scrum_report/scrum_report.pdf \
		./doc/intermediate_presentation/intermediate_presentation.pdf \
		./doc/presentation/presentation.pdf

.PHONY: clean
clean:
	find ./doc -type f \( -name '*.aux' -o -name '*.log' -o -name '*.bbl' -o -name '*.blg' -o -name '*.out' -o -name '*.pdf' -o -name '*.lof' -o -name '*.lot' -o -name '*.toc' -o -name '*.snm' -o -name '*.nav' \) -delete