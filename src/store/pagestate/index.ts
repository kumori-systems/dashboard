import Actions from './actions';
import Getters from './getters';
import Mutations from './mutations';
import State from './state';

export default {
  'state': new State(),
  'getters': new Getters(),
  'mutations': new Mutations(),
  'actions': new Actions()
};