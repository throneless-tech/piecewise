import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './FormRenderer.css';

const FormRenderer = props => {
  const { onSave, onLoad } = props;
  const [form, setForm] = React.useState(null);
  const formContainer = React.useRef(null);

  const handleSave = event => {
    console.log('in handle save: ', event);
    if (event) {
      event.preventDefault();
    }
    console.log(event);
  };

  const saveAction = action => {
    console.log('in saveAction: ', action);
    action.preventDefault();
  };

  useEffect(() => {
    const initializeForm = ({ setForm, formContainer }) => {
      let renderer;
      const options = {
        renderContainer: formContainer.current,
        debug: true,
        actions: {
          click: {
            btn: saveAction,
          },
        },
        events: {
          onSave: handleSave,
        },
      };
      import('formeo')
        .then(({ FormeoRenderer }) => {
          // if (onSave) {
          //   options.actions = {
          //     click: {
          //       btn: saveAction,
          //     },
          //   };
          //   options.events = { onSave: handleSave };
          // }
          renderer = new FormeoRenderer(options);
          setForm(renderer);
          console.log('renderer: ', renderer);
          return onLoad();
        })
        .then(res => renderer.render(res.data))
        .catch(err => {
          console.error('Error: ', err);
        });
    };

    if (!form) {
      initializeForm({ setForm, formContainer });
    }
  }, [form]);

  return (
    <div>
      <form
        className="formeo-renderer"
        ref={el => (formContainer.current = el)}
      />
    </div>
  );
};

FormRenderer.propTypes = {
  onSave: PropTypes.func,
  onLoad: PropTypes.func,
};

export default FormRenderer;
