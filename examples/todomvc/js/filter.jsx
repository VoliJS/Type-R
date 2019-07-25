import React from 'react-mvx'

const Filter = ( { count, filterLink, onClear } ) => (
    <footer className="footer">
		<span className="todo-count">
			<strong>{ count }</strong> item left
		</span>

        <ul className="filters">
            <Radio checkedLink={ filterLink.equals( null ) }
                   href="#/">
                All
            </Radio>
            <Radio checkedLink={ filterLink.equals( false ) }
                   href="#/active">
                Active
            </Radio>
            <Radio checkedLink={ filterLink.equals( true ) }
                   href="#/completed">
                Completed
            </Radio>
        </ul>

        <button className="clear-completed"
                onClick={ onClear }>
            Clear completed
        </button>
    </footer>
);

export default Filter;

const Radio = ( { checkedLink, children, ...props } ) => (
    <li>
        <a className={ checkedLink.value ? 'selected' : '' }
        onClick={ () => checkedLink.set( true ) }
            { ...props }>
            { children }
        </a>
    </li>
);
