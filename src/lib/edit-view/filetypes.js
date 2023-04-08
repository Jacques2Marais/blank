// TODO: more file types from https://github.com/github/linguist/blob/master/lib/linguist/languages.yml

export const fileTypes = {
    '': 'Text',
    'txt': 'Text',
    'md': 'Markdown',
    'html': 'HTML',
    'htm': 'HTML',
    'css': 'CSS',
    'js': 'JavaScript',
    'json': 'JSON',
    'xml': 'XML'
}

export function typeFromPath(path) {
    const fileName = path.split('/').pop();
    const ext = fileName.substring(fileName.indexOf('.') + 1);
    return fileTypes[ext] || fileTypes[''];
}