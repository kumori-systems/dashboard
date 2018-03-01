import { ECloudElement } from './ecloudelement';

/** Abstract class which represents a parameter in the ECloud environment. */
export abstract class Parameter extends ECloudElement {
  
  /** Type of parameter. */
  readonly _parameter_type: string;

  /**
   * Abstract class which represents a parameter in the ECloud environment.
   * @param type <string> Type of the parameter.
   */
  constructor(type: string) {
    super(ECloudElement.ECLOUDELEMENT_TYPE.PARAMETER);
    this._parameter_type = type;
  }
  
}

/** A boolean ECloud parameter. */
export class BooleanParameter extends Parameter {

  /**
   * A boolean ECloud parameter.
   */
  constructor() {
    super('eslap://eslap.cloud/parameter/boolean/1_0_0');
  }

}

/** An integer ECloud parameter. */
export class IntegerParameter extends Parameter {

  /**
   * An integer ECloud parameter.
   */
  constructor() {
    super('eslap://eslap.cloud/parameter/integer/1_0_0');
  }

}

/** A JSON ECloud parameter. */
export class JsonParameter extends Parameter {

  /**
   * A JSON ECloud parameter.
   */
  constructor() {
    super('eslap://eslap.cloud/parameter/json/1_0_0');
  }
  
}

/** A list ECloud parameter. */
export class ListParameter extends Parameter {

  /**
   * A list ECloud parameter.
   */
  constructor() {
    super('eslap://eslap.cloud/parameter/list/1_0_0');
  }

}

/** A number ECloud parameter. */
export class NumberParameter extends Parameter {

  /**
   * A number ECloud parameter.
   */
  constructor() {
    super('eslap://eslap.cloud/parameter/number/1_0_0');
  }

}

/** A string ECloud parameter. */
export class StringParameter extends Parameter {

  /**
   * A string ECloud parameter.
   */
  constructor() {
    super('eslap://eslap.cloud/parameter/string/1_0_0');
  }

}