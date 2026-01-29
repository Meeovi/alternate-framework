import { v4 as uuidv4 } from 'uuid';
export function generateId() {
    return uuidv4();
}
export function stripHTML(original) {
    if (!original)
        return;
    return original.replace(/(<([^>]+)>)/gi, '');
}
export function truncateString(str, num) {
    if (!str)
        return;
    if (str.length <= num)
        return str;
    return str.slice(0, num) + '...';
}
export function truncateHTML(html, num) {
    if (!html)
        return;
    return truncateString(stripHTML(html), num);
}
export function slugify(str) {
    if (!str)
        return;
    return str
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
}
export function deslugify(str) {
    if (!str)
        return;
    return str
        .trim()
        .toLowerCase()
        .replace(/[-_]+/g, ' ')
        .replace(/ +/g, ' ')
        .replace(/(^| )(\w)/g, (s) => s.toUpperCase());
}
export function getDomainNameFromEmail(email) {
    const temp = email.replace(/.*@/, '').split('.');
    return temp[temp.length - 2] ?? temp[0] ?? '';
}
export function toTitleCase(str) {
    if (!str)
        return;
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
export function snakeToCamel(s) {
    return s.replace(/_(\w)/g, function (_m, p1) {
        return p1 ? p1.toUpperCase() : '';
    });
}
export function convertIconName(name) {
    if (!name)
        return;
    const prefix = 'material-symbols:';
    const kebabCase = name.replace(/_/g, '-');
    return prefix + kebabCase;
}
export function snakeToKebab(s) {
    return s.replace(/_(\w)/g, function (_m, p1) {
        return p1 ? '-' + p1.toLowerCase() : '';
    });
}
export function maybePluralize(count, noun, suffix = 's') {
    return `${noun}${count !== 1 ? suffix : ''}`;
}
export function calculateReadTime(str, wordsPerMinute = 200) {
    if (!str)
        return;
    const cleaned = str.replace(/(<([^>]+)>)/gi, '');
    const noOfWords = cleaned.split(/\s+/g).filter(Boolean).length;
    const minutes = noOfWords / wordsPerMinute;
    const readTime = Math.max(1, Math.ceil(minutes));
    return `${readTime} min read`;
}
