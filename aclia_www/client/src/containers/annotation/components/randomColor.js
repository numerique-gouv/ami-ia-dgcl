const colors = [
    '#007E81',
    '#FF2C76',
    '#FF1001',
    '#1C1B30',
    '#495E0B',
    '#0000FF',
    '#512808',
    '#4043AC',
    '#872167',
    '#FF7A11',
    '#05c46b',
    '#227093',
    '#5C061C',
    '#CA6924',
    '#2c2c54',
    '#cd6133',
    '#b33939',
    '#227093',
    '#218c74',
    '#84817a',
    '#273c75',
    '#40739e',
    '#e84118',
    '#6F1E51',
    '#009432',
    '#D980FA',
    '#006266',
    '#1B1464',
    '#833471',
    '#4b4b4b',
    '#218c74',
    '#cd6133',
    '#b33939',
];

const getRndInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min) ) + min;
};

const randomColor = () => {
    return colors[getRndInteger(0, 1000) % colors.length];
};

const randomArrayColor = (iterateNbr) => {
    const colorArray = [];
    const iterateColor = iteration => clbk => {
        if (iteration > 0) {
            clbk();
            iterateColor(iteration - 1)(clbk);
        }
    };
    iterateColor(iterateNbr)(() => colorArray.push(randomColor()));
    return colorArray;
};

const hex2rgba = (hex, alpha = 1) => {
    const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
    return `rgba(${r},${g},${b},${alpha})`;
};

export { randomColor, randomArrayColor, hex2rgba};
