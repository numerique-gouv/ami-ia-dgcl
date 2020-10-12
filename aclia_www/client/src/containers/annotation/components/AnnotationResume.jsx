/* eslint-disable react/jsx-no-bind */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
//Actions
import * as RecordActions from '../../../core/redux/record/actions.js';
import * as RecordSelector from '../../../core/redux/record/selector.js';

class AnnotationResume extends React.Component {
    /**
     * propTypes - define props
     * @desc define props required or not
     * @version 1.0
     * @since 1.0
     * @private
     */
    static propTypes = {
        currentLetter: PropTypes.object.isRequired,
        mainLetterAnnotations: PropTypes.object.isRequired,
        step: PropTypes.number.isRequired,
    };
    /**
     * defaultProps - define default value props
     * @desc define not required props
     * @private
     * @version 1.0
     * @since 1.0
     */

    constructor(props) {
        super(props);
        this.state = {
            currentLetter: props.currentLetter,
            mainLetterAnnotations: props.mainLetterAnnotations,
            step: props.step,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const keys = [
            'currentLetter',
            'mainLetterAnnotations',
            'step',
        ];

        const mutableProps = _.pick(nextProps, keys);
        const stateToCompare = _.pick(prevState, keys);

        if (!_.isEqual(mutableProps, stateToCompare)) {
            return mutableProps;
        }
        return null;
    }

    render() {
        const { currentLetter, mainLetterAnnotations, step } = this.state;
        const annotations = mainLetterAnnotations ? mainLetterAnnotations.toJS() : null;

        return (
            <div style={ {fontWeight: '900'} }>
                { annotations && currentLetter &&
                    <>
                        <span style={ {float: 'left', width: '100%'} }>
                            {`Nature: ${annotations.nature_content ? annotations.nature_content : '-'}`}
                        </span>
                        <span style={ {float: 'left', width: '100%'} }>
                            {`Matière niv.1: ${annotations.matiere_1 ? annotations.matiere_1 : '-'}`}
                        </span>
                        <span style={ {float: 'left', width: '100%'} }>
                            {`Matière niv.2: ${annotations.matiere_2 ? annotations.matiere_2 : '-'}`}
                        </span>
                        { step > 4 &&
                            <span style={ {float: 'left', width: '100%'} }>
                                {`Transmissible: ${annotations.isTransmissible ? 'oui' : 'non'}`}
                            </span>
                        }
                    </>
                }
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        currentLetter: RecordSelector.getCurrentLetter(state),
        step: RecordSelector.getStep(state),
        mainLetterAnnotations: RecordSelector.getMainLetterAnnotations(state),
    };
}
/**
 * @function mapDispatchToProps - redux method
 * @desc make action available in the props component.
 * @param {object} dispatch - redux-thunk dispatcher
 * @return {object} MeActions & AnonymousAddressActions
 * @version 1.0
 * @since 1.0
 * @private
 */
function mapDispatchToProps(dispatch) {
    return bindActionCreators({ ...RecordActions }, dispatch);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AnnotationResume));
