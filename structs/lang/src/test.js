const { useEffect, useState, PureComponent, createRef } = React,
  { Provider, connect, useDispatch, useSelector } = ReactRedux,
  { applyMiddleware, createStore, combineReducers } = Redux,
  thunk = ReduxThunk.default;

//constants
const dbName = 'personsNotesDB',
  tableName = 'personalNotes';

//update object immutably
const updateObject = (oldObject, UpdatedValues) => {
  return {
    ...oldObject,
    ...UpdatedValues,
  };
};

//==================================
// generic indexedDB methods
//==================================
const createIndexedDB = ({
  indexedDBName,
  indexedDBVersion,
  objectStoreName,
  primaryKey,
}) => {
  //create database
  const request = window.indexedDB.open(indexedDBName, indexedDBVersion);
  //will be executed only if the given indexedDBName doesn't exist or if we upgrade the version of it
  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    db.createObjectStore(objectStoreName, { keyPath: primaryKey }); //create table with the required primary key
  };
  return request;
};

//get the required object store after adding the required permissions
const getTable = ({ db, objectStore, permission }) => {
  const tx = db.transaction(objectStore, permission);
  return tx.objectStore(objectStore);
};

//add entry to object store
const addTableEntry = ({ objectStore, entry }) => {
  objectStore.add(entry);
};

//get the selected entry from object store
const getTableEntry = ({ objectStore, entry }) => {
  objectStore.get(entry);
};

//get all entries from object store
const getAllTableEntries = (objectStore) => {
  return objectStore.getAll();
};

//count entries in object store
const countTableEntries = (objectStore) => {
  return objectStore.count();
};

//delete entry form object store
const deleteEntryTable = ({ objectStore, id }) => {
  return objectStore.delete(id);
};

//edit entry in object store
const editTableEntry = ({ objectStore, entry }) => {
  return objectStore.put(entry);
};

/*=====================end generic indexedDB methods====================*/

//==================================
// redux store
//==================================
//action types
const SET_PERSONS_NOTES_LIST = '[PERSONS] SET_PERSONS_NOTES_LIST';
const ADD_PERSONAL_NOTE = '[PERSONS] ADD_PERSONAL_NOTE';
const EDIT_PERSONAL_NOTE = '[PERSONS] EDIT_PERSONAL_NOTE';
const REMOVE_PERSONAL_NOTE = '[PERSONS] REMOVE_PERSONAL_NOTE';

//actions
const setPersonsNotesList = () => (dispatch) => {
  const request = createIndexedDB({
    indexedDBName: dbName,
    indexedDBVersion: 1,
    objectStoreName: tableName,
    primaryKey: 'id',
  });
  request.onsuccess = (e) => {
    const personsList = getTable({
      db: e.target.result,
      objectStore: tableName,
      permission: 'readonly',
    });

    //get list of notes
    getAllTableEntries(personsList).onsuccess = (getAllEvent) => {
      const personsList = getAllEvent.target.result.reverse();
      dispatch({
        type: SET_PERSONS_NOTES_LIST,
        list: personsList,
      });
    };
  };
};

const addPersonalNote =
  ({ personName, note }) =>
  (dispatch) => {
    const request = createIndexedDB({
        indexedDBName: dbName,
        indexedDBVersion: 1,
        objectStoreName: tableName,
        primaryKey: 'id',
      }),
      noteEntry = {
        id: 0,
        date: new Date(),
        name: personName,
        note,
      };

    request.onsuccess = (e) => {
      const personsList = getTable({
        db: e.target.result,
        objectStore: tableName,
        permission: 'readwrite',
      });

      //get number of entries in table
      countTableEntries(personsList).onsuccess = (countEvent) => {
        //set unique id for each entry
        noteEntry['id'] = countEvent.target.result + 1 + Math.random();

        //add entry to table (redux)
        dispatch({
          type: ADD_PERSONAL_NOTE,
          noteEntry,
        });

        //add entry to table (indexDB)
        personsList.add(noteEntry).onsuccess = () => {
          //count new number of entries after adding successfully
          countTableEntries(personsList).onsuccess = (countEventAfterAdd) => {
            if (countEventAfterAdd.target.result >= 20) {
              //get current entries
              getAllTableEntries(personsList).onsuccess = (getEvent) => {
                const last = getEvent.target.result[0];
                //remove the oldest entry from errors list table
                deleteEntryTable({ objectStore: personsList, id: last.id });
              };
            }
          };
        };
      };
    };
  };

const editPersonalNote =
  ({ id, note }) =>
  (dispatch, getState) => {
    const state = getState(),
      list = getPersonsNotesList({ state }),
      entry = list.find((el) => el.id === id),
      request = createIndexedDB({
        indexedDBName: dbName,
        indexedDBVersion: 1,
        objectStoreName: tableName,
        primaryKey: 'id',
      });

    entry.note = note;

    request.onsuccess = (e) => {
      const personsList = getTable({
        db: e.target.result,
        objectStore: tableName,
        permission: 'readwrite',
      });

      editTableEntry({ objectStore: personsList, entry }).onsuccess = (e) => {
        dispatch({ type: EDIT_PERSONAL_NOTE, id });
      };
    };
  };

const removePersonalNote = (id) => (dispatch) => {
  const request = createIndexedDB({
    indexedDBName: dbName,
    indexedDBVersion: 1,
    objectStoreName: tableName,
    primaryKey: 'id',
  });

  request.onsuccess = (e) => {
    const personsList = getTable({
      db: e.target.result,
      objectStore: tableName,
      permission: 'readwrite',
    });

    //remove the required entry from the table
    deleteEntryTable({ objectStore: personsList, id }).onsuccess = (e) => {
      dispatch({
        type: REMOVE_PERSONAL_NOTE,
        id,
      });
    };
  };
};

//reducer
const initialState = {
  personsNotesList: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PERSONS_NOTES_LIST: {
      return updateObject(state, { personsNotesList: action.list });
    }
    case ADD_PERSONAL_NOTE: {
      return updateObject(state, {
        personsNotesList: [...state.personsNotesList, action.noteEntry],
      });
    }
    case REMOVE_PERSONAL_NOTE: {
      const personsNotesList = _.cloneDeep(state.personsNotesList),
        newList = personsNotesList.filter((el) => el.id !== action.id);
      return updateObject(state, { personsNotesList: newList });
    }
    default:
      return state;
  }
};

//selectors
const getPersonsNotesList = ({ state }) => state.persons.personsNotesList;

//This is the final reducer that gets attached to our store.
const rootReducer = combineReducers({
  persons: reducer,
});

//create the store
let store = createStore(rootReducer, applyMiddleware(thunk));

/*=====================end redux store====================*/

// modal component
class Modal extends PureComponent {
  modalWrapper = createRef();

  renderHeader = () => {
    const { useModalHeader, modalTitle, modalClosed } = this.props;
    const headerMarkup = (
      <div className='modal-header'>
        <h4 className='modal-title'>{modalTitle}</h4>
        <button className='close-modal' onClick={modalClosed}>
          ×
        </button>
      </div>
    );

    if (useModalHeader === false) {
      return;
    }
    return headerMarkup;
  };

  renderFooter = () => {
    const { useModalFooter, modalClosed, footerBtnText, footerBtnListener } =
      this.props;

    const footerMarkup = (
      <div className='modal-footer'>
        <button
          className='close-modal'
          onClick={() => {
            footerBtnListener();
          }}
        >
          Submit
        </button>
        <button
          className='close-modal'
          onClick={() => {
            modalClosed();
          }}
        >
          {footerBtnText ? footerBtnText : 'close'}
        </button>
      </div>
    );

    if (useModalFooter === false) {
      return;
    }
    return footerMarkup;
  };

  render() {
    const { show, modalClosed, children } = this.props;

    return (
      <div
        className={`modal-window ${!show ? 'inactive-modal' : ''}`}
        onClick={(e) => {
          if (e.target === this.modalWrapper.current) {
            modalClosed();
          }
        }}
      >
        <div className='modal-wrapper' ref={this.modalWrapper}>
          <div className={`modal ${show ? 'animate-modal' : ''}`}>
            {this.renderHeader()}
            <div className='modal-body'>{show ? children : null}</div>
            {this.renderFooter()}
          </div>
        </div>
      </div>
    );
  }
}

//app component
const App = () => {
  const dispatch = useDispatch(),
    list = useSelector((state) => getPersonsNotesList({ state })),
    [name, setName] = useState(''),
    [note, setNote] = useState(''),
    [editNoteInput, setEditNoteInput] = useState(''),
    [noteToEditData, setNoteToEditData] = useState({}),
    [isModal, setIsModal] = useState(false);

  useEffect(() => {
    dispatch(setPersonsNotesList());
  }, []);

  const openModal = (el) => {
    setIsModal(true);
    setEditNoteInput(el.note);
    setNoteToEditData(el);
  };

  const closeModal = () => {
    setIsModal(false);
    setEditNoteInput('');
    setNoteToEditData({});
  };

  const nameHandler = ({ target: { value } }) => {
    setName(value);
  };

  const noteHandler = ({ target: { value } }) => {
    setNote(value);
  };

  const editNoteHandler = ({ target: { value } }) => {
    setEditNoteInput(value);
  };

  const addNewNote = () => {
    dispatch(addPersonalNote({ personName: name, note }));
    setName('');
    setNote('');
  };

  const deleteNote = (id) => {
    dispatch(removePersonalNote(id));
  };

  const editRequiredNote = () => {
    dispatch(editPersonalNote({ id: noteToEditData.id, note: editNoteInput }));
    setIsModal(false);
  };

  return (
    <div className='container'>
      <h3>Notes app using indexedDB</h3>
      <p>
        This app allows you to perform <strong>CRUD</strong> (create, read,
        update and destroy) functionality on indexedDB using react and redux
      </p>
      <p className='note'>
        Note: to open indexedDB in your dev tool: application => indexedDB
      </p>
      <input
        value={name}
        onChange={nameHandler}
        placeholder='Enter your name'
      />
      <input
        value={note}
        onChange={noteHandler}
        placeholder='Enter your note'
      />
      <button onClick={addNewNote}>Add new note</button>
      {list.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Person Name</th>
              <th>Note</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((el) => (
              <tr key={el.id}>
                <td>{el.name}</td>
                <td>{el.note}</td>
                <td>{moment(el.date).format('YYYY-MM-DD HH:mm:ss')}</td>
                <td>
                  <i
                    className='fas fa-trash-alt'
                    onClick={() => deleteNote(el.id)}
                  />
                  <i className='fas fa-edit' onClick={() => openModal(el)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className='no-data'>
          There is no data in your indexedDB, please insert data to see notes
          table
        </p>
      )}
      <Modal
        modalClosed={closeModal}
        show={isModal}
        modalTitle='Modal header'
        footerBtnText='close'
        footerBtnListener={editRequiredNote}
        useModalHeader={true}
        useModalFooter={true}
      >
        <input
          value={editNoteInput}
          onChange={editNoteHandler}
          placeholder='Enter edited note'
        />
      </Modal>
    </div>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector('#app')
);
