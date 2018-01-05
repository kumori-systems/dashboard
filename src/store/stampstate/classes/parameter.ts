import { EcloudElement } from './ecloudelement';

/** Abstract class which represents a parameter in ecloud. */
export abstract class Parameter extends EcloudElement {
  constructor(uri: string) {
    super(uri);
  }
}

/** A boolean ecloud parameter. */
export class BooleanParameter extends Parameter {
  constructor() {
    super('eslap://eslap.cloud/parameter/boolean/1_0_0');
  }
}

/** A integer ecloud parameter. */
export class IntegerParameter extends Parameter {
  constructor() {
    super('eslap://eslap.cloud/parameter/integer/1_0_0');
  }
}

/** A json ecloud parameter. */
export class JsonParameter extends Parameter {
  constructor() {
    super('eslap://eslap.cloud/parameter/json/1_0_0');
  }
}

/** A list ecloud parameter. */
export class ListParameter extends Parameter {
  constructor() {
    super('eslap://eslap.cloud/parameter/list/1_0_0');
  }
}

/** A number ecloud parameter. */
export class NumberParameter extends Parameter {
  constructor() {
    super('eslap://eslap.cloud/parameter/number/1_0_0');
  }
}

/** A string ecloud parameter. */
export class StringParameter extends Parameter {
  constructor() {
    super('eslap://eslap.cloud/parameter/string/1_0_0');
  }
}