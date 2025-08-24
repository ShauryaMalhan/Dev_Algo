import katex from 'katex';

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

    return html;
};
