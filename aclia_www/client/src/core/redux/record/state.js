import { Map } from 'immutable';

/**
 * @constant state auth state
 * @public
 * @version 1.0
 * @since 1.0
 */
export default Map({
    isPending: false,
    error: null,
    recordList: null,
    toAnnot: true,
    annotationList: null,
    currentLetter: null,
    letter: null,
    pJList: null,
    step: 0,
    mainLetter: null,
    mainLetterAnnotations: null,
});
