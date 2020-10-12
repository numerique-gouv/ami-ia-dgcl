/* eslint-disable react/jsx-no-bind */
import React from 'react';
import PropTypes from 'prop-types';

export default class Question extends React.PureComponent {
    /**
     * propTypes - define props
     * @desc define props required or not
     * @version 1.0
     * @since 1.0
     * @private
     */
    static propTypes = {
        question: PropTypes.string.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = {
            question: props.question,
        };
    }
    render() {
        return (
            <div style={ {fontSize: '16px', fontWeight: '900', textAlign: 'center', marginBottom: '15px'} }>
                <span>
                    {this.props.question}
                </span>
            </div>
        );
    }
}
