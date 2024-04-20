# `render-promise`

`render-promise` is a lightweight JavaScript library that simplifies the process of rendering components asynchronously by wrapping them in a function that returns a Promise.

## Installation

You can install render-promise via npm:

```
npm install @qkudev/render-promise
```

Usage
To use `render-promise`, simply import it into your project:

```
import { renderPromise } from 'render-promise';
```

Then, you can use the `renderPromise` function to render your component asynchronously:

```
const myComponent = (props) => {
  return (
    <div>
      {/_ Your component JSX _/}
    </div>
  );
};

const [asyncFunction, Component] = renderPromise(myComponent);

asyncFunction({ /_ props _/ })
  .then(value => {
    // Handle success
  })
  .catch(error => {
    // Handle error
  });
```

## How It Works

The `renderPromise` function accepts a component and wraps it in a function that returns a Promise. When this function is called, the component is rendered within an `AsyncRoot`. The component receives two special props: `resolve` and `reject`.

- When the resolve prop is called within the component, the component will be unmounted and the Promise will be resolved with the provided value.
- If the reject prop is called within the component, the Promise will be rejected with the provided error.

This allows for easy rendering of components asynchronously, with the ability to control the flow of execution through Promise resolution and rejection.

## Example

```
import renderPromise from 'render-promise';

const AreYourSure = ({ resolve }) => {
  const onAccept = () => {
    resolve(true)
  }

  const onCancel = () => {
    resolve(false)
  }


  return (
    <Modal>
      <p>Are You sure?</p>
      <button type="button" onClick={onAccept}>Yes</button>
      <button type="button" onClick={onCancel}>No</button>
    </Modal>
  );
};

const [areYouSure, AsyncAreYouSure] = renderPromise<boolean>(AreYouSure);

// Render `<AsyncAreYouSure/>` and later in thunk/saga/etc.

const deleteUser = createAsyncThunk('deleteUser', async () => {
  // call the component render as async function
  const sure = await areYouSure();
  if (!sure) {
    return;
  }

  // do the effect ...
})
```

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

Feel free to extend or modify this `README` according to your preferences!
