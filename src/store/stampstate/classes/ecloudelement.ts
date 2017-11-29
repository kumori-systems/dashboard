/**
 * Element provided in the Ecloud ecosystem.
 */
export abstract class EcloudElement {

  /**
   * <string> Uniform Resource Identifier for this element following the format
   * 'eslap://<domain>/<elmenttype>/<name>/<version>'.
   */
  readonly _uri: string;
  /** <string> Where the element belongs to. */
  readonly _domain: string;
  /** <EcloudElement.Type> Signals the kind of element. */
  readonly _type: EcloudElement.TYPE;
  /** <string> Friendly readable text to identify the element. */
  readonly _name: string;
  /**
   * <string> Identifier of the version of the element.
   * <Major>_<Minor>_<Revision>
   */
  readonly _version: string;

  /**
   * Element provided in the Ecloud ecosystem.
   * @param URI <string> Uniform Resource Identifier for this element following
   * the format 'eslap://<domain>/<elmenttype>/<name>/<version>'.
   */
  constructor(URI: string) {
    this._uri = URI;

    try {
      if (!URI) throw new Error();
      let splitted = URI.split('/');
      // Check two first static pieces
      if (
        (splitted[0] !== 'eslap:' && splitted[0] !== 'slap:')
        || splitted[1] !== ''
      ) throw new Error();
      
      if (splitted[0] !== 'slap:') {
        console.warn('deprecated protocol slap: at %s', URI);
      }

      // Save domain
      this._domain = splitted[2];
      // Save type
      this._type = <EcloudElement.TYPE>splitted[3];
      // Save name even if it's got more than one word
      this._name = splitted[4];
      for (let i = 5; i < splitted.length - 1; i++) {
        this._name += '/' + splitted[i];
      }
      // Check verion's format
      this._version = splitted[splitted.length - 1];
      let versionSplitted = this._version.split('_');
      let major: number = Number.parseInt(versionSplitted[0]);
      let minor: number = Number.parseInt(versionSplitted[1]);
      let revision: number = Number.parseInt(versionSplitted[2]);

      // After all is checked the uri is assigned
      this._uri = URI;
    } catch (e) {
      throw new Error('Invalid URI format for EcloudElement: ' + URI);
    }
  }
}


export module EcloudElement {
  /** Signals the kind of element. */
  export enum TYPE {
    COMPONENT = 'component',
    SERVICE = 'service',
    RUNTIME = 'runtime',
    PROTOCOL = 'protocol',
    PARAMETER = 'parameter',
    MANIFEST = 'manifest',
    RESOURCE = 'resource',
    CHANNEL = 'channel'
  };
}