# Redux Usage
This file documents how Redux works with Webtex.

## Background
The following is background information on Redux. Familiar with Redux? Skip to next section.

### State
- A _state_ is a plain object or array.

	~~~typescript
	type State = {}; // plain object describing state
	~~~
- Example:
	~~~typescript
	type Note = {
		index: number;
		title: string;
		content: string;
	};
	type Folder = {
		notes: Note[];
		tags: string[];
	}
	~~~

### Action
- An _action_ is an object with a `type` and `payload`:
- The `type` is the name of a change.
- The `payload` is the data needed to carry out that change.
- Example:

	~~~typescript
	type NoteAction = {
		type: "EDIT_TITLE" | "EDIT_CONTENT" | "DELETE_NOTE" | "SAVE_NOTE";
		payload: Note;
	};
	type TagAction = {
		type: "ADD_TAG" | "REMOVE_TAG";
		payload: {tag: string};
	};
	~~~

### Reducer
- To update the state, we use a _reducer_.
- Reducers take an initial state, copy the initial state, and return the new state if any.
	~~~typescript
	type Reducer = (currentState:State, action:{type:string, payload:object}) => State
	~~~

- Reducers only calculate new state based on the State and Action args.
- Reducers do not modify existing state.
- Reducers make immutable updates—make a copy, change, and save the changed copy.
- Reducers always synchronous/no side effects
- Because all reducers need an initial state (above, the `currentState`), there must be an initial state passed.
- Example (initial state):

	~~~typescript
	const initialState: Folder = {
		notes: [
			{id: 'Lecture 1', content: '...'},
			{id: 'Lecture 2', content: '...'},
			{id: 'Lecture 3', content: '...'}
		]
		tags: ["math", "cs"]
	},
	~~~

- Above, the state is an object of type `Folder`.

#### Reducer Logic
1. Check if reducer cares about the Action
2. Yes? Update the copy with new values, modify, return new state.
3. No? Return state unchanged.
- Example:

	~~~typescript
	const notesReducer = (state:Folder, action:NoteAction) => {
		switch (action.type) {
			case 'EDIT_TITLE': {
				return {
					...state,
					notes: state.notes.map((note, noteIndex) => {
						if (noteIndex !== action.payload.index) {
							return note;
						}
						return {
							...note,
							title: action.payload.title;
						}
					})
				}
			}
			case 'EDIT_CONTENT': {
				return {
					...state,
					notes: state.notes.map((note, noteIndex) => {
						if (noteIndex !== action.payload.index) {
							return note;
						}
						return {
							...note,
							content: action.payload.content;
						}
					})
				}
			}
			case 'SAVE_NOTE': {
				return {...state, notes: [...state.notes, action.payload]}
			}
			case 'DELETE_NOTE': {
				return {
					...state,
					notes: state.notes.filter(note => note.title !== action.payload.title)
				}
			}
			default: 
				return state;
		}
	}
	
	const visibilityReducer = (state: Folder, action: TagAction) => {
		switch (action.type) {
			case 'ADD_TAG': {
				return {
					...state,
					tags: [...state.tags, action.payload.tag]
				}
			}
			case 'DELETE_TAG': {
				return {
					...state,
					tags: state.tags.filter(tag => tag !== action.payload.tag)
				}
			}
			default:
				return state;
		}
	}
	~~~

- Note: Always have a `default` case.

### Root Reducer
- The _root reducer_:
	- is the one reducer that handles all actions passed to `dispatch` functions.
	- calculates the entire `newState`.
- General rule: One section of state to one reducer.
- From the examples, there are really two sections, the `visibility` and an individual `notes`.
- We should split these.
- Example. First, rewrite the reducers to just handle the slices they're expected to handle. Below, we change the `notesReducer`'s `state` type to `Note[]` because it will only handle the `Note[]` slice of the `Folder` state.

	~~~typescript
	const notesReducer = (state:Note[], action:NoteAction) => {
		switch (action.type) {
			case 'EDIT_TITLE': {
				return state.notes.map((note, noteIndex) => {
						if (noteIndex !== action.payload.index) {
							return note;
						}
						return {
							...note,
							title: action.payload.title;
						}
				})
			}
			case 'EDIT_CONTENT': {
				return state.notes.map((note, noteIndex) => {
						if (noteIndex !== action.payload.index) {
							return note;
						}
						return {
							...note,
							content: action.payload.content;
						}
					})
			}
			case 'SAVE': {
				return [...state.notes, action.payload]
			}
			case 'DELETE': {
			}
			default: 
				return state;
		}
	}
	
	const tagsReducer = (state: string[], action: VisibilityAction) => {
		switch (action.type) {
			case 'ADD_TAG': {
				return [...state.tags, action.payload.tag]
			}
			case 'DELETE_TAG': {
				return state.tags.filter(tag => tag !== action.payload.tag)
			}
			default:
				return state;
		}
	}
	~~~

	The root reducer is thus:

	~~~typescript
	const rootReducer = (state = initialState, action: NoteAction | VisibilityAction) => {
		return {
			notes: notesReducer(state.notes, action),
			tags: tagsReducer(state.tags, action)
		}
	}
	~~~

	Redux has a method called `combineReducers` that puts it all together:

	~~~typescript
	import {combineReducers} from 'redux';
	
	const rootReducer = combineReducers({
		notes: notesReducer,
		tags: tagsReducer
	})
	~~~

### Stores
- All Redux state lives an object called a _store_.
- The store packages all of the reducers and the root reducer:

	~~~typescript
	import {createStore} from 'redux'
	import rootReducer from './reducer';
	
	const store = createStore(rootReducer);
	~~~

- We can pass the initial state to this store:

	~~~typescript
	import {createStore} from 'redux'
	import rootReducer from './reducer';

	const initialState: Folder = {
		notes: [
			{id: 'Lecture 1', content: '...'},
			{id: 'Lecture 2', content: '...'},
			{id: 'Lecture 3', content: '...'}
		],
		tags: ["math", "cs"]
	},
	
	const store = createStore(rootReducer, initialState);
	~~~
	

### Dispatch 
- To update the Redux store (the `Folder`), we use the store's _dispatch_ method.
- Example. Remove a tag from `Folder`:

	~~~typescript
	store.dispatch({type: 'ADD_TAG', payload: { tag: "physics" }})
	~~~
	
	Now the `Folder` state is:
	
	~~~typescript
	Folder: {
		notes: [
			{id: 'Lecture 1', content: '...'},
			{id: 'Lecture 2', content: '...'},
			{id: 'Lecture 3', content: '...'}
		],
		tags: ["math", "cs", "physics"]
	},
	~~~

### getState
- To get the current state (the `Folder` object as of now), use the `getState` method:

	~~~typescript
	const currentState = store.getState()
	~~~

### Selectors
- To get a particular value from the state, we can write a _Selector_.
- Example. Get the last inserted tag:

~~~typescript
const selectLastTag = state: Folder => {
	return Folder.tags[Folder.tags.length - 1];
}
~~~

