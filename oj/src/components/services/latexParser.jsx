import katex from 'katex';

/**
 * A utility function to decode HTML entities.
 * @param {string} html - The HTML string to decode.
 * @returns {string} The decoded text.
 */
const decodeHtmlEntities = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
};
export const parsePolygonLatex = (text) => {
    if (!text) return '';

    let decodedText = decodeHtmlEntities(text);
    let html = decodedText;
    html = html.replace(/\$\$(.*?)\$\$|\\\[(.*?)\\\]/g, (match, formula1, formula2) => {
        const formula = formula1 || formula2;
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

    html = html.replace(/\\includegraphics(?:\[width=(.*?)\])?{(.*?)}/g, (match, width, url) => {
        const style = width ? `width: ${width};` : 'max-width: 100%; height: auto;';
        return `<img src="${url}" alt="Problem image" style="${style}" />`;
    });

    html = html.replace(/\\begin{center}([\s\S]*?)\\end{center}/g, '<div style="text-align: center;">$1</div>');

    return html;
};
