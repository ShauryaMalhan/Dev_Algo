import katex from 'katex';

export const parsePolygonLatex = (text) => {
    if (!text) return '';

    let html = text;

    html = html.replace(/&gt;/g, '>');
    html = html.replace(/&lt;/g, '<');

    // Display math: \[ ... \]
    html = html.replace(/\\\[([\s\S]*?)\\\]/g, (match, formula) => {
        try {
            return katex.renderToString(formula, { displayMode: true, throwOnError: false });
        } catch (e) {
            return match;
        }
    });

    // Display math: $$ ... $$
    html = html.replace(/\$\$(.*?)\$\$/g, (match, formula) => {
        try {
            return katex.renderToString(formula, { displayMode: true, throwOnError: false });
        } catch (e) {
            return match;
        }
    });

    // Inline math: $ ... $
    html = html.replace(/\$(.*?)\$/g, (match, formula) => {
        try {
            return katex.renderToString(formula, { displayMode: false, throwOnError: false });
        } catch (e) {
            return match;
        }
    });

    // Text styles
    const styles = [
        { tex: /\\textbf{(.*?)}/g, htmlTag: 'strong' },
        { tex: /\\textit{(.*?)}/g, htmlTag: 'em' },
        { tex: /\\texttt{(.*?)}/g, htmlTag: 'code' },
        { tex: /\\underline{(.*?)}/g, htmlTag: 'u' },
    ];
    styles.forEach(style => {
        html = html.replace(style.tex, `<${style.htmlTag}>$1</${style.htmlTag}>`);
    });

    // Lists
    html = html.replace(/\\begin{itemize}/g, '<ul>');
    html = html.replace(/\\end{itemize}/g, '</ul>');
    html = html.replace(/\\begin{enumerate}/g, '<ol>');
    html = html.replace(/\\end{enumerate}/g, '</ol>');
    html = html.replace(/\\item/g, '<li>');

    // Images
    html = html.replace(/\\includegraphics(?:\[(.*?)\])?{(.*?)}/g, (match, options, src) => {
        let style = 'height: auto; max-width: 100%;';

        if (options) {
            const widthMatch = options.match(/width\s*=\s*([^\],]+)/);
            if (widthMatch) {
                let width = widthMatch[1].trim();

                // Handle LaTeX units
                width = width
                    .replace(/\\textwidth/g, '100%')
                    .replace(/\\linewidth/g, '100%')
                    .replace(/in/g, 'in') // keep inches if explicitly used
                    .replace(/cm/g, 'cm'); // allow cm

                style = `width: ${width}; height: auto;`;
            }
        }

        return `<img src="${src}" alt="Problem image" style="${style}" />`;
    });


    // Center alignment
    html = html.replace(/\\begin{center}([\s\S]*?)\\end{center}/g, '<div style="text-align: center;">$1</div>');

    return html;
};
