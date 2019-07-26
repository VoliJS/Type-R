import React from 'react'

export const Filter = ( { count, $filter, onClear } ) => (
    <footer className="footer">
		<span className="todo-count">
			<strong>{ count }</strong> item left
		</span>

        <ul className="filters">
            <Radio $checked={ $filter.equals( null ) }
                   href="#/">
                All
            </Radio>
            <Radio $checked={ $filter.equals( false ) }
                   href="#/active">
                Active
            </Radio>
            <Radio $checked={ $filter.equals( true ) }
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

const Radio = ( { $checked, children, ...props } ) => (
    <li>
        <a className={ $checked.value ? 'selected' : '' }
        onClick={ () => $checked.set( true ) }
            { ...props }>
            { children }
        </a>
    </li>
);
