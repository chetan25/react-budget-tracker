import { setConfig } from "next/config";
import config from "./next.config";

setConfig(config.publicRuntimeConfig);
setConfig(config.assetPrefix);

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({
    adapter: new Adapter()
});

// jest.mock('Lib/with-lang');

//polyfill
// require('object.fromentries').shim();