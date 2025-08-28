import katex from 'katex';

/**
 * A custom parser to convert Polygon-style LaTeX into HTML.
 * @param {string} text - The raw text from the database.
 * @returns {string} An HTML string.
 */
export const parsePolygonLatex = (text) => {
    if (!text) return '';

    let html = text;

    html = html.replace(/\$\$(.*?)\$\$/g, (match, formula) => {
        try {
            return katex.renderToString(formula, { displayMode: true, throwOnError: false });
        } catch (e) { return match; }
    });
    html = html.replace(/\$(.*?)\$/g, (match, formula) => {
        try {
            return katex.renderToString(formula, { displayMode: false, throwOnError: false });
        } catch (e) { return match; }
    });
    const styles = [
        { tex: /\\textbf{(.*?)}/g, htmlTag: 'strong' },
        { tex: /\\textit{(.*?)}/g, htmlTag: 'em' },
        { tex: /\\texttt{(.*?)}/g, htmlTag: 'code' },
        { tex: /\\underline{(.*?)}/g, htmlTag: 'u' },
    ];
    styles.forEach(style => {
        html = html.replace(style.tex, `<${style.htmlTag}>$1</${style.htmlTag}>`);
    });

    html = html.replace(/\\begin{itemize}/g, '<ul>');
    html = html.replace(/\\end{itemize}/g, '</ul>');
    html = html.replace(/\\begin{enumerate}/g, '<ol>');
    html = html.replace(/\\end{enumerate}/g, '</ol>');
    html = html.replace(/\\item/g, '<li>');
    html = html.replace(/\\includegraphics(?:\[.*?\])?{(.*?)}/g, '<img src="$1" alt="Problem image" style="max-width: 100%; height: auto;" />');
    html = html.replace(/\\begin{center}([\s\S]*?)\\end{center}/g, '<div style="text-align: center;">$1</div>');

    return html;
};
