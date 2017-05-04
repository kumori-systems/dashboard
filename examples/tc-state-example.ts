export default {
  'tcState': {
    'deployedServices': {
      'slap://eslap.cloud/deployments/20170503_070503/c10c1661': {
        'manifest': {
          'owner': 'admin-eslap@iti.es',
          'components': {
            'eslap://eslap.cloud/components/monitor/1_0_0': {
              'required': {},
              'provided': {
                'sepdest': {
                  'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                  'channel_type': 'slap://slapdomain/endpoints/reply'
                }
              },
              'profile': {
                'threadability': '*'
              },
              'spec': 'http://eslap.cloud/manifest/component/1_0_0',
              'name': 'eslap://eslap.cloud/components/monitor/1_0_0',
              'runtime': 'eslap://eslap.cloud/runtime/native/1_0_1',
              'code': '4e7b33ab0b1d80a5245e70f2ca08ce2b66679341',
              'codelocator': 'eslap://eslap.cloud/components/monitor/1_0_0/image.tgz',
              'configuration': {
                'config': 'string'
              },
              'resources': [],
              'external': 'TBD'
            }
          },
          'service': {
            'configuration_spread': {},
            'defaults': {},
            'configuration': {},
            'connectors': [
              {
                'providers': [
                  {
                    'channel': 'sepdest',
                    'component': 'monitor'
                  }
                ],
                'dependents': [
                  {
                    'channel': 'sepsource'
                  }
                ],
                'type': 'slap://slapdomain/connectors/lb'
              }
            ],
            'components': {
              'monitor': 'eslap://eslap.cloud/components/monitor/1_0_0'
            },
            'name': 'eslap://eslap.cloud/services/monitor/1_0_0',
            'spec': 'http://eslap.cloud/manifest/service/1_0_0'
          },
          'versions': {
            'http://eslap.cloud/manifest/deployment/1_0_0': {
              'owner': 'admin-eslap@iti.es',
              'components-resources': {
                'monitor': {},
                '__service': {}
              },
              'components-configuration': {
                'monitor': {
                  'config': {
                    'planner': {
                      'domain': 'stamp-ticket740.slap53.iti.es',
                      'port': 80,
                      'address': '10.1.0.37'
                    },
                    'measureBuffer': {
                      'maxsize': 1000000
                    },
                    'metricStorage': [
                      {
                        'topics': [
                          'measures',
                          'metrics'
                        ],
                        'transport': {
                          'http-port': 9004,
                          'http-host': '10.1.1.37'
                        },
                        'type': 'http'
                      },
                      {
                        'topics': [
                          'measures',
                          'metrics'
                        ],
                        'transport': {
                          'http-port': 28778,
                          'http-host': '10.1.1.37'
                        },
                        'type': 'httpLogstash'
                      }
                    ],
                    'restapi': {
                      'bodySizeLimit': '50mb',
                      'saveMeasures': true
                    }
                  }
                },
                '__service': {
                  'monitor': {
                    'config': {
                      'planner': {
                        'domain': 'stamp-ticket740.slap53.iti.es',
                        'port': 80,
                        'address': '10.1.0.37'
                      },
                      'measureBuffer': {
                        'maxsize': 1000000
                      },
                      'metricStorage': [
                        {
                          'topics': [
                            'measures',
                            'metrics'
                          ],
                          'transport': {
                            'http-port': 9004,
                            'http-host': '10.1.1.37'
                          },
                          'type': 'http'
                        },
                        {
                          'topics': [
                            'measures',
                            'metrics'
                          ],
                          'transport': {
                            'http-port': 28778,
                            'http-host': '10.1.1.37'
                          },
                          'type': 'httpLogstash'
                        }
                      ],
                      'restapi': {
                        'bodySizeLimit': '50mb',
                        'saveMeasures': true
                      }
                    }
                  }
                }
              },
              'resources': {},
              'runtimes': {
                'eslap://eslap.cloud/runtime/native/1_0_1': {
                  'metadata': {
                    'layerId': 'e6b2ce236ca21cb3e52bb23403203f5289474d8e0e75101cf62f114850353d7d',
                    'software': {
                      'libsodium': {
                        'version': '1.0.5'
                      },
                      'libzmq5': {
                        'version': '4.1.3'
                      },
                      'nodejs': {
                        'version': '4.3.2'
                      },
                      'ecloud-runtime-agent': {
                        'version': '1.0.0'
                      }
                    },
                    'os_release': 'Trusty Tahr',
                    'os_version': '14.04',
                    'os_name': 'Ubuntu',
                    'description': 'ECloud Ubuntu 14.04'
                  },
                  'entrypoint': '/eslap/runtime-agent/scripts/start-runtime-agent.sh',
                  'sourcedir': '/eslap/component',
                  'agent': 'eslap://eslap.cloud/runtime-agent/1_0_0',
                  'name': 'eslap://eslap.cloud/runtime/native/1_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'spec': 'http://eslap.cloud/manifest/deployment/1_0_0',
              'servicename': 'eslap://eslap.cloud/services/monitor/1_0_0',
              'interconnection': true,
              'configuration': {
                'parameters': {
                  'monitor': {
                    'config': {
                      'planner': {
                        'domain': 'stamp-ticket740.slap53.iti.es',
                        'port': 80,
                        'address': '10.1.0.37'
                      },
                      'measureBuffer': {
                        'maxsize': 1000000
                      },
                      'metricStorage': [
                        {
                          'topics': [
                            'measures',
                            'metrics'
                          ],
                          'transport': {
                            'http-port': 9004,
                            'http-host': '10.1.1.37'
                          },
                          'type': 'http'
                        },
                        {
                          'topics': [
                            'measures',
                            'metrics'
                          ],
                          'transport': {
                            'http-port': 28778,
                            'http-host': '10.1.1.37'
                          },
                          'type': 'httpLogstash'
                        }
                      ],
                      'restapi': {
                        'bodySizeLimit': '50mb',
                        'saveMeasures': true
                      }
                    }
                  }
                },
                'resources': {}
              },
              'roles': {
                'monitor': {
                  'resources': {
                    '__resilience': 1,
                    '__bandwidth': 1,
                    '__iopsintensive': false,
                    '__ioperf': 1,
                    '__memory': 1,
                    '__cpu': 1,
                    '__instances': 1
                  }
                }
              },
              'name': 'slap://eslap.cloud/deployments/20170503_070503/c10c1661',
              'service': {
                'connectors': [
                  {
                    'provided': [
                      {
                        'endpoint': 'sepdest',
                        'role': 'monitor'
                      }
                    ],
                    'depended': [
                      {
                        'endpoint': 'http-monitor'
                      }
                    ],
                    'type': 'eslap://eslap.cloud/connector/loadbalancer/1_0_0'
                  }
                ],
                'channels': {
                  'provides': [
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/channel/reply/1_0_0',
                      'name': 'http-monitor'
                    }
                  ],
                  'requires': []
                },
                'roles': [
                  {
                    'parameters': {},
                    'resources': {},
                    'component': 'eslap://eslap.cloud/components/monitor/1_0_0',
                    'name': 'monitor'
                  }
                ],
                'configuration': {
                  'parameters': [
                    {
                      'type': 'eslap://eslap.cloud/parameter/json/1_0_0',
                      'name': 'monitor'
                    }
                  ],
                  'resources': []
                },
                'name': 'eslap://eslap.cloud/services/monitor/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'components': {
                'eslap://eslap.cloud/components/monitor/1_0_0': {
                  'codelocator': 'eslap://eslap.cloud/components/monitor/1_0_0/image.tgz',
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0',
                  'name': 'eslap://eslap.cloud/components/monitor/1_0_0',
                  'runtime': 'eslap://eslap.cloud/runtime/native/1_0_1',
                  'code': '4e7b33ab0b1d80a5245e70f2ca08ce2b66679341',
                  'channels': {
                    'provides': [
                      {
                        'name': 'sepdest',
                        'type': 'eslap://eslap.cloud/channel/reply/1_0_0',
                        'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0'
                      }
                    ],
                    'requires': []
                  },
                  'configuration': {
                    'resources': [],
                    'parameters': [
                      {
                        'name': 'config',
                        'type': 'eslap://eslap.cloud/parameter/json/1_0_0'
                      }
                    ]
                  },
                  'profile': {
                    'threadability': '*'
                  }
                }
              }
            },
            'slap://slapdomain/manifests/deployment/0_0_1': {
              'owner': 'admin-eslap@iti.es',
              'components': {
                'eslap://eslap.cloud/components/monitor/1_0_0': {
                  'required': {},
                  'provided': {
                    'sepdest': {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'channel_type': 'slap://slapdomain/endpoints/reply'
                    }
                  },
                  'profile': {
                    'threadability': '*'
                  },
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0',
                  'name': 'eslap://eslap.cloud/components/monitor/1_0_0',
                  'runtime': 'eslap://eslap.cloud/runtime/native/1_0_1',
                  'code': '4e7b33ab0b1d80a5245e70f2ca08ce2b66679341',
                  'codelocator': 'eslap://eslap.cloud/components/monitor/1_0_0/image.tgz',
                  'configuration': {
                    'config': 'string'
                  },
                  'resources': [],
                  'external': 'TBD'
                }
              },
              'service': {
                'configuration_spread': {},
                'defaults': {},
                'configuration': {},
                'connectors': [
                  {
                    'providers': [
                      {
                        'channel': 'sepdest',
                        'component': 'monitor'
                      }
                    ],
                    'dependents': [
                      {
                        'channel': 'sepsource'
                      }
                    ],
                    'type': 'slap://slapdomain/connectors/lb'
                  }
                ],
                'components': {
                  'monitor': 'eslap://eslap.cloud/components/monitor/1_0_0'
                },
                'name': 'eslap://eslap.cloud/services/monitor/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'SLA': 'TBD',
              'arrangement': {
                'monitor': {
                  'failurezones': 1,
                  'bandwidth': 1,
                  'memory': 1,
                  'cpu': 1,
                  'maxinstances': 1,
                  '__instances': 1,
                  '__cpu': 1,
                  '__memory': 1,
                  '__ioperf': 1,
                  '__iopsintensive': false,
                  '__bandwidth': 1,
                  '__resilience': 1,
                  'mininstances': 1
                }
              },
              'runtimes': {
                'eslap://eslap.cloud/runtime/native/1_0_1': {
                  'metadata': {
                    'layerId': 'e6b2ce236ca21cb3e52bb23403203f5289474d8e0e75101cf62f114850353d7d',
                    'software': {
                      'libsodium': {
                        'version': '1.0.5'
                      },
                      'libzmq5': {
                        'version': '4.1.3'
                      },
                      'nodejs': {
                        'version': '4.3.2'
                      },
                      'ecloud-runtime-agent': {
                        'version': '1.0.0'
                      }
                    },
                    'os_release': 'Trusty Tahr',
                    'os_version': '14.04',
                    'os_name': 'Ubuntu',
                    'description': 'ECloud Ubuntu 14.04'
                  },
                  'entrypoint': '/eslap/runtime-agent/scripts/start-runtime-agent.sh',
                  'sourcedir': '/eslap/component',
                  'agent': 'eslap://eslap.cloud/runtime-agent/1_0_0',
                  'name': 'eslap://eslap.cloud/runtime/native/1_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'resources': {},
              'spec': 'slap://slapdomain/manifests/deployment/0_0_1',
              'servicename': 'eslap://eslap.cloud/services/monitor/1_0_0',
              'name': 'slap://eslap.cloud/deployments/20170503_070503/c10c1661',
              'interconnection': true,
              'entrypoints': {},
              'components-configuration': {
                'monitor': {
                  'config': {
                    'planner': {
                      'domain': 'stamp-ticket740.slap53.iti.es',
                      'port': 80,
                      'address': '10.1.0.37'
                    },
                    'measureBuffer': {
                      'maxsize': 1000000
                    },
                    'metricStorage': [
                      {
                        'topics': [
                          'measures',
                          'metrics'
                        ],
                        'transport': {
                          'http-port': 9004,
                          'http-host': '10.1.1.37'
                        },
                        'type': 'http'
                      },
                      {
                        'topics': [
                          'measures',
                          'metrics'
                        ],
                        'transport': {
                          'http-port': 28778,
                          'http-host': '10.1.1.37'
                        },
                        'type': 'httpLogstash'
                      }
                    ],
                    'restapi': {
                      'bodySizeLimit': '50mb',
                      'saveMeasures': true
                    }
                  }
                },
                '__service': {
                  'monitor': {
                    'config': {
                      'planner': {
                        'domain': 'stamp-ticket740.slap53.iti.es',
                        'port': 80,
                        'address': '10.1.0.37'
                      },
                      'measureBuffer': {
                        'maxsize': 1000000
                      },
                      'metricStorage': [
                        {
                          'topics': [
                            'measures',
                            'metrics'
                          ],
                          'transport': {
                            'http-port': 9004,
                            'http-host': '10.1.1.37'
                          },
                          'type': 'http'
                        },
                        {
                          'topics': [
                            'measures',
                            'metrics'
                          ],
                          'transport': {
                            'http-port': 28778,
                            'http-host': '10.1.1.37'
                          },
                          'type': 'httpLogstash'
                        }
                      ],
                      'restapi': {
                        'bodySizeLimit': '50mb',
                        'saveMeasures': true
                      }
                    }
                  }
                }
              },
              'components-resources': {
                'monitor': {},
                '__service': {}
              },
              'configuration': {
                'monitor': {
                  'config': {
                    'planner': {
                      'domain': 'stamp-ticket740.slap53.iti.es',
                      'port': 80,
                      'address': '10.1.0.37'
                    },
                    'measureBuffer': {
                      'maxsize': 1000000
                    },
                    'metricStorage': [
                      {
                        'topics': [
                          'measures',
                          'metrics'
                        ],
                        'transport': {
                          'http-port': 9004,
                          'http-host': '10.1.1.37'
                        },
                        'type': 'http'
                      },
                      {
                        'topics': [
                          'measures',
                          'metrics'
                        ],
                        'transport': {
                          'http-port': 28778,
                          'http-host': '10.1.1.37'
                        },
                        'type': 'httpLogstash'
                      }
                    ],
                    'restapi': {
                      'bodySizeLimit': '50mb',
                      'saveMeasures': true
                    }
                  }
                }
              }
            },
            'http://eslap.cloud/manifest/deployment/1_0_0_CLASSIC': {
              'owner': 'admin-eslap@iti.es',
              'components-resources': {
                'monitor': {},
                '__service': {}
              },
              'components-configuration': {
                'monitor': {
                  'config': {
                    'planner': {
                      'domain': 'stamp-ticket740.slap53.iti.es',
                      'port': 80,
                      'address': '10.1.0.37'
                    },
                    'measureBuffer': {
                      'maxsize': 1000000
                    },
                    'metricStorage': [
                      {
                        'topics': [
                          'measures',
                          'metrics'
                        ],
                        'transport': {
                          'http-port': 9004,
                          'http-host': '10.1.1.37'
                        },
                        'type': 'http'
                      },
                      {
                        'topics': [
                          'measures',
                          'metrics'
                        ],
                        'transport': {
                          'http-port': 28778,
                          'http-host': '10.1.1.37'
                        },
                        'type': 'httpLogstash'
                      }
                    ],
                    'restapi': {
                      'bodySizeLimit': '50mb',
                      'saveMeasures': true
                    }
                  }
                },
                '__service': {
                  'monitor': {
                    'config': {
                      'planner': {
                        'domain': 'stamp-ticket740.slap53.iti.es',
                        'port': 80,
                        'address': '10.1.0.37'
                      },
                      'measureBuffer': {
                        'maxsize': 1000000
                      },
                      'metricStorage': [
                        {
                          'topics': [
                            'measures',
                            'metrics'
                          ],
                          'transport': {
                            'http-port': 9004,
                            'http-host': '10.1.1.37'
                          },
                          'type': 'http'
                        },
                        {
                          'topics': [
                            'measures',
                            'metrics'
                          ],
                          'transport': {
                            'http-port': 28778,
                            'http-host': '10.1.1.37'
                          },
                          'type': 'httpLogstash'
                        }
                      ],
                      'restapi': {
                        'bodySizeLimit': '50mb',
                        'saveMeasures': true
                      }
                    }
                  }
                }
              },
              'resources': {},
              'runtimes': {
                'eslap://eslap.cloud/runtime/native/1_0_1': {
                  'metadata': {
                    'layerId': 'e6b2ce236ca21cb3e52bb23403203f5289474d8e0e75101cf62f114850353d7d',
                    'software': {
                      'libsodium': {
                        'version': '1.0.5'
                      },
                      'libzmq5': {
                        'version': '4.1.3'
                      },
                      'nodejs': {
                        'version': '4.3.2'
                      },
                      'ecloud-runtime-agent': {
                        'version': '1.0.0'
                      }
                    },
                    'os_release': 'Trusty Tahr',
                    'os_version': '14.04',
                    'os_name': 'Ubuntu',
                    'description': 'ECloud Ubuntu 14.04'
                  },
                  'entrypoint': '/eslap/runtime-agent/scripts/start-runtime-agent.sh',
                  'sourcedir': '/eslap/component',
                  'agent': 'eslap://eslap.cloud/runtime-agent/1_0_0',
                  'name': 'eslap://eslap.cloud/runtime/native/1_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'spec': 'http://eslap.cloud/manifest/deployment/1_0_0',
              'servicename': 'eslap://eslap.cloud/services/monitor/1_0_0',
              'interconnection': true,
              'configuration': {
                'parameters': {
                  'monitor': {
                    'config': {
                      'planner': {
                        'domain': 'stamp-ticket740.slap53.iti.es',
                        'port': 80,
                        'address': '10.1.0.37'
                      },
                      'measureBuffer': {
                        'maxsize': 1000000
                      },
                      'metricStorage': [
                        {
                          'topics': [
                            'measures',
                            'metrics'
                          ],
                          'transport': {
                            'http-port': 9004,
                            'http-host': '10.1.1.37'
                          },
                          'type': 'http'
                        },
                        {
                          'topics': [
                            'measures',
                            'metrics'
                          ],
                          'transport': {
                            'http-port': 28778,
                            'http-host': '10.1.1.37'
                          },
                          'type': 'httpLogstash'
                        }
                      ],
                      'restapi': {
                        'bodySizeLimit': '50mb',
                        'saveMeasures': true
                      }
                    }
                  }
                },
                'resources': {}
              },
              'roles': {
                'monitor': {
                  'resources': {
                    '__resilience': 1,
                    '__bandwidth': 1,
                    '__iopsintensive': false,
                    '__ioperf': 1,
                    '__memory': 1,
                    '__cpu': 1,
                    '__instances': 1
                  }
                }
              },
              'name': 'slap://eslap.cloud/deployments/20170503_070503/c10c1661',
              'service': {
                'connectors': [
                  {
                    'provided': [
                      {
                        'endpoint': 'sepdest',
                        'role': 'monitor'
                      }
                    ],
                    'depended': [
                      {
                        'endpoint': 'http-monitor'
                      }
                    ],
                    'type': 'eslap://eslap.cloud/connector/loadbalancer/1_0_0'
                  }
                ],
                'channels': {
                  'provides': [
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/channel/reply/1_0_0',
                      'name': 'http-monitor'
                    }
                  ],
                  'requires': []
                },
                'roles': [
                  {
                    'parameters': {},
                    'resources': {},
                    'component': 'eslap://eslap.cloud/components/monitor/1_0_0',
                    'name': 'monitor'
                  }
                ],
                'configuration': {
                  'parameters': [
                    {
                      'type': 'eslap://eslap.cloud/parameter/json/1_0_0',
                      'name': 'monitor'
                    }
                  ],
                  'resources': []
                },
                'name': 'eslap://eslap.cloud/services/monitor/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'components': {
                'eslap://eslap.cloud/components/monitor/1_0_0': {
                  'codelocator': 'eslap://eslap.cloud/components/monitor/1_0_0/image.tgz',
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0',
                  'name': 'eslap://eslap.cloud/components/monitor/1_0_0',
                  'runtime': 'eslap://eslap.cloud/runtime/native/1_0_1',
                  'code': '4e7b33ab0b1d80a5245e70f2ca08ce2b66679341',
                  'channels': {
                    'provides': [
                      {
                        'name': 'sepdest',
                        'type': 'eslap://eslap.cloud/channel/reply/1_0_0',
                        'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0'
                      }
                    ],
                    'requires': []
                  },
                  'configuration': {
                    'resources': [],
                    'parameters': [
                      {
                        'name': 'config',
                        'type': 'eslap://eslap.cloud/parameter/json/1_0_0'
                      }
                    ]
                  },
                  'profile': {
                    'threadability': '*'
                  }
                }
              }
            }
          },
          'SLA': 'TBD',
          'arrangement': {
            'monitor': {
              'failurezones': 1,
              'bandwidth': 1,
              'memory': 1,
              'cpu': 1,
              'maxinstances': 1,
              '__instances': 1,
              '__cpu': 1,
              '__memory': 1,
              '__ioperf': 1,
              '__iopsintensive': false,
              '__bandwidth': 1,
              '__resilience': 1,
              'mininstances': 1
            }
          },
          'runtimes': {
            'eslap://eslap.cloud/runtime/native/1_0_1': {
              'metadata': {
                'layerId': 'e6b2ce236ca21cb3e52bb23403203f5289474d8e0e75101cf62f114850353d7d',
                'software': {
                  'libsodium': {
                    'version': '1.0.5'
                  },
                  'libzmq5': {
                    'version': '4.1.3'
                  },
                  'nodejs': {
                    'version': '4.3.2'
                  },
                  'ecloud-runtime-agent': {
                    'version': '1.0.0'
                  }
                },
                'os_release': 'Trusty Tahr',
                'os_version': '14.04',
                'os_name': 'Ubuntu',
                'description': 'ECloud Ubuntu 14.04'
              },
              'entrypoint': '/eslap/runtime-agent/scripts/start-runtime-agent.sh',
              'sourcedir': '/eslap/component',
              'agent': 'eslap://eslap.cloud/runtime-agent/1_0_0',
              'name': 'eslap://eslap.cloud/runtime/native/1_0_1',
              'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
            }
          },
          'resources': {},
          'spec': 'slap://slapdomain/manifests/deployment/0_0_1',
          'servicename': 'eslap://eslap.cloud/services/monitor/1_0_0',
          'name': 'slap://eslap.cloud/deployments/20170503_070503/c10c1661',
          'interconnection': true,
          'entrypoints': {},
          'components-configuration': {
            'monitor': {
              'config': {
                'planner': {
                  'domain': 'stamp-ticket740.slap53.iti.es',
                  'port': 80,
                  'address': '10.1.0.37'
                },
                'measureBuffer': {
                  'maxsize': 1000000
                },
                'metricStorage': [
                  {
                    'topics': [
                      'measures',
                      'metrics'
                    ],
                    'transport': {
                      'http-port': 9004,
                      'http-host': '10.1.1.37'
                    },
                    'type': 'http'
                  },
                  {
                    'topics': [
                      'measures',
                      'metrics'
                    ],
                    'transport': {
                      'http-port': 28778,
                      'http-host': '10.1.1.37'
                    },
                    'type': 'httpLogstash'
                  }
                ],
                'restapi': {
                  'bodySizeLimit': '50mb',
                  'saveMeasures': true
                }
              }
            },
            '__service': {
              'monitor': {
                'config': {
                  'planner': {
                    'domain': 'stamp-ticket740.slap53.iti.es',
                    'port': 80,
                    'address': '10.1.0.37'
                  },
                  'measureBuffer': {
                    'maxsize': 1000000
                  },
                  'metricStorage': [
                    {
                      'topics': [
                        'measures',
                        'metrics'
                      ],
                      'transport': {
                        'http-port': 9004,
                        'http-host': '10.1.1.37'
                      },
                      'type': 'http'
                    },
                    {
                      'topics': [
                        'measures',
                        'metrics'
                      ],
                      'transport': {
                        'http-port': 28778,
                        'http-host': '10.1.1.37'
                      },
                      'type': 'httpLogstash'
                    }
                  ],
                  'restapi': {
                    'bodySizeLimit': '50mb',
                    'saveMeasures': true
                  }
                }
              }
            }
          },
          'components-resources': {
            'monitor': {},
            '__service': {}
          },
          'configuration': {
            'monitor': {
              'config': {
                'planner': {
                  'domain': 'stamp-ticket740.slap53.iti.es',
                  'port': 80,
                  'address': '10.1.0.37'
                },
                'measureBuffer': {
                  'maxsize': 1000000
                },
                'metricStorage': [
                  {
                    'topics': [
                      'measures',
                      'metrics'
                    ],
                    'transport': {
                      'http-port': 9004,
                      'http-host': '10.1.1.37'
                    },
                    'type': 'http'
                  },
                  {
                    'topics': [
                      'measures',
                      'metrics'
                    ],
                    'transport': {
                      'http-port': 28778,
                      'http-host': '10.1.1.37'
                    },
                    'type': 'httpLogstash'
                  }
                ],
                'restapi': {
                  'bodySizeLimit': '50mb',
                  'saveMeasures': true
                }
              }
            }
          }
        },
        'instanceList': {
          'eslap.cloud_monitor_5': {
            'incnum': 1,
            'component': 'monitor',
            'cnsocket': 'tcp://10.1.0.35:5310',
            'cnid': '84bea579-65d3-4752-82f9-67217c6d1666',
            'connected': true
          }
        },
        'involvedCNs': [
          {
            'initialResources': {
              'disk': 10,
              'bandwidth': 1000,
              'memory': 12,
              'cpu': 8
            },
            'size': 'm1.medium',
            'id': '84bea579-65d3-4752-82f9-67217c6d1666',
            'publicIp': '172.24.4.18',
            'privateIp': '10.1.0.35',
            'subnet': 'cb327f96-db68-4848-8a7e-1c565e263686',
            'net': '10dd0acf-137f-4024-8d40-1e9d433f4630',
            'zone': 'zone-0',
            'imageId': '9e3c665e-16c5-4825-afe4-d89867eaed19',
            'tags': {
              'slap': 'ticket740',
              'name': 'ticket740.cn'
            }
          }
        ]
      },
      'slap://eslap.cloud/deployments/20170503_070459/9df375a4': {
        'manifest': {
          'owner': 'admin-eslap@iti.es',
          'components': {
            'slap://slapdomain/components/httpsep/0_0_1': {
              'required': {
                'sepsource': {
                  'protocol': 'TBD',
                  'channel_type': 'slap://slapdomain/endpoints/request'
                }
              },
              'provided': {},
              'spec': 'http://eslap.cloud/manifest/component/1_0_0',
              'name': 'slap://slapdomain/components/httpsep/0_0_1',
              'runtime': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
              'code': '3e28a90e4a201181ca96f945dc54b59387489077',
              'configuration': {},
              'resources': [],
              'external': 'TBD',
              'profile': 'QoS profile. TBD'
            }
          },
          'service': {
            'configuration_spread': {},
            'defaults': {},
            'configuration': {},
            'connectors': [
              {
                'providers': [],
                'dependents': [
                  {
                    'channel': 'sepsource',
                    'component': 'sep'
                  }
                ],
                'type': 'slap://slapdomain/connectors/lb'
              }
            ],
            'components': {
              'sep': 'slap://slapdomain/components/httpsep/0_0_1'
            },
            'name': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
            'spec': 'http://eslap.cloud/manifest/service/1_0_0'
          },
          'versions': {
            'http://eslap.cloud/manifest/deployment/1_0_0': {
              'owner': 'admin-eslap@iti.es',
              'components-resources': {
                'sep': {},
                '__service': {
                  'vhost': {
                    'resource': {
                      'parameters': {
                        'vhost': 'monitor-ticket740.slap53.iti.es'
                      },
                      'name': 'eslap://eslap.cloud/resources/vhost/monitor',
                      'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                    },
                    'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'server_cert': {
                    'resource': {
                      'parameters': null
                    },
                    'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                    'locator': null
                  }
                }
              },
              'components-configuration': {
                'sep': {},
                '__service': {
                  'clientcert': false,
                  'TLS': false
                }
              },
              'resources': {
                'vhost': {
                  'resource': {
                    'parameters': {
                      'vhost': 'monitor-ticket740.slap53.iti.es'
                    },
                    'name': 'eslap://eslap.cloud/resources/vhost/monitor',
                    'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                },
                'server_cert': {
                  'resource': {
                    'parameters': null
                  },
                  'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                  'locator': null
                }
              },
              'runtimes': {
                'slap://slapdomain/runtimes/managed/nodejs/0_0_1': {
                  'name': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'spec': 'http://eslap.cloud/manifest/deployment/1_0_0',
              'servicename': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
              'configuration': {
                'parameters': {
                  'clientcert': false,
                  'TLS': false
                },
                'resources': {
                  'vhost': 'eslap://eslap.cloud/resources/vhost/monitor',
                  'server_cert': null
                }
              },
              'interconnection': true,
              'roles': {
                'sep': {
                  'resources': {
                    '__resilience': 1,
                    '__bandwidth': 1,
                    '__iopsintensive': false,
                    '__ioperf': 1,
                    '__memory': 1,
                    '__cpu': 1,
                    '__instances': 1
                  }
                }
              },
              'name': 'slap://eslap.cloud/deployments/20170503_070459/9df375a4',
              'service': {
                'connectors': [
                  {
                    'provided': [
                      {
                        'endpoint': 'frontend'
                      }
                    ],
                    'depended': [
                      {
                        'endpoint': 'sepsource',
                        'role': 'sep'
                      }
                    ],
                    'type': 'eslap://eslap.cloud/connector/loadbalancer/1_0_0'
                  }
                ],
                'channels': {
                  'provides': [],
                  'requires': [
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/endpoint/request/1_0_0',
                      'name': 'frontend'
                    }
                  ]
                },
                'roles': [
                  {
                    'parameters': {},
                    'resources': {},
                    'component': 'slap://slapdomain/components/httpsep/0_0_1',
                    'name': 'sep'
                  }
                ],
                'configuration': {
                  'parameters': [
                    {
                      'default': 'false',
                      'type': 'eslap://eslap.cloud/parameter/boolean/1_0_0',
                      'name': 'TLS'
                    },
                    {
                      'default': 'false',
                      'type': 'eslap://eslap.cloud/parameter/boolean/1_0_0',
                      'name': 'clientcert'
                    }
                  ],
                  'resources': [
                    {
                      'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                      'name': 'server_cert'
                    },
                    {
                      'type': 'eslap://eslap.cloud/resource/vhost/1_0_0',
                      'name': 'vhost'
                    }
                  ]
                },
                'name': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'components': {
                'slap://slapdomain/components/httpsep/0_0_1': {
                  'channels': {
                    'requires': [
                      {
                        'protocol': 'TBD',
                        'type': 'eslap://eslap.cloud/channel/request/1_0_0',
                        'name': 'sepsource'
                      }
                    ],
                    'provides': []
                  },
                  'profile': 'QoS profile. TBD',
                  'configuration': {
                    'parameters': [],
                    'resources': []
                  },
                  'code': '3e28a90e4a201181ca96f945dc54b59387489077',
                  'runtime': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'name': 'slap://slapdomain/components/httpsep/0_0_1',
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0'
                }
              }
            },
            'slap://slapdomain/manifests/deployment/0_0_1': {
              'owner': 'admin-eslap@iti.es',
              'components': {
                'slap://slapdomain/components/httpsep/0_0_1': {
                  'required': {
                    'sepsource': {
                      'protocol': 'TBD',
                      'channel_type': 'slap://slapdomain/endpoints/request'
                    }
                  },
                  'provided': {},
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0',
                  'name': 'slap://slapdomain/components/httpsep/0_0_1',
                  'runtime': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'code': '3e28a90e4a201181ca96f945dc54b59387489077',
                  'configuration': {},
                  'resources': [],
                  'external': 'TBD',
                  'profile': 'QoS profile. TBD'
                }
              },
              'service': {
                'configuration_spread': {},
                'defaults': {},
                'configuration': {},
                'connectors': [
                  {
                    'providers': [],
                    'dependents': [
                      {
                        'channel': 'sepsource',
                        'component': 'sep'
                      }
                    ],
                    'type': 'slap://slapdomain/connectors/lb'
                  }
                ],
                'components': {
                  'sep': 'slap://slapdomain/components/httpsep/0_0_1'
                },
                'name': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'SLA': 'TBD',
              'arrangement': {
                'sep': {
                  'failurezones': 1,
                  'bandwidth': 1,
                  'memory': 1,
                  'cpu': 1,
                  'maxinstances': 1,
                  '__instances': 1,
                  '__cpu': 1,
                  '__memory': 1,
                  '__ioperf': 1,
                  '__iopsintensive': false,
                  '__bandwidth': 1,
                  '__resilience': 1,
                  'mininstances': 1
                }
              },
              'runtimes': {
                'slap://slapdomain/runtimes/managed/nodejs/0_0_1': {
                  'name': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'resources': {
                'vhost': {
                  'resource': {
                    'parameters': {
                      'vhost': 'monitor-ticket740.slap53.iti.es'
                    },
                    'name': 'eslap://eslap.cloud/resources/vhost/monitor',
                    'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                },
                'server_cert': {
                  'resource': {
                    'parameters': null
                  },
                  'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                  'locator': null
                }
              },
              'spec': 'slap://slapdomain/manifests/deployment/0_0_1',
              'servicename': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
              'name': 'slap://eslap.cloud/deployments/20170503_070459/9df375a4',
              'interconnection': true,
              'entrypoints': {
                'sep': {
                  'instancespath': false,
                  'domain': 'monitor-ticket740.slap53.iti.es',
                  'sslonly': false,
                  'secrets': {}
                }
              },
              'components-configuration': {
                'sep': {
                  'domain': 'monitor-ticket740.slap53.iti.es',
                  'sslonly': false,
                  'secrets': {}
                },
                '__service': {
                  'clientcert': false,
                  'TLS': false
                }
              },
              'components-resources': {
                'sep': {},
                '__service': {
                  'vhost': {
                    'resource': {
                      'parameters': {
                        'vhost': 'monitor-ticket740.slap53.iti.es'
                      },
                      'name': 'eslap://eslap.cloud/resources/vhost/monitor',
                      'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                    },
                    'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'server_cert': {
                    'resource': {
                      'parameters': null
                    },
                    'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                    'locator': null
                  }
                }
              },
              'configuration': {
                'clientcert': false,
                'TLS': false
              }
            },
            'http://eslap.cloud/manifest/deployment/1_0_0_CLASSIC': {
              'owner': 'admin-eslap@iti.es',
              'components-resources': {
                'sep': {},
                '__service': {
                  'vhost': {
                    'resource': {
                      'parameters': {
                        'vhost': 'monitor-ticket740.slap53.iti.es'
                      },
                      'name': 'eslap://eslap.cloud/resources/vhost/monitor',
                      'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                    },
                    'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'server_cert': {
                    'resource': {
                      'parameters': null
                    },
                    'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                    'locator': null
                  }
                }
              },
              'components-configuration': {
                'sep': {},
                '__service': {
                  'clientcert': false,
                  'TLS': false
                }
              },
              'resources': {
                'vhost': {
                  'resource': {
                    'parameters': {
                      'vhost': 'monitor-ticket740.slap53.iti.es'
                    },
                    'name': 'eslap://eslap.cloud/resources/vhost/monitor',
                    'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                },
                'server_cert': {
                  'resource': {
                    'parameters': null
                  },
                  'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                  'locator': null
                }
              },
              'runtimes': {
                'slap://slapdomain/runtimes/managed/nodejs/0_0_1': {
                  'name': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'spec': 'http://eslap.cloud/manifest/deployment/1_0_0',
              'servicename': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
              'configuration': {
                'parameters': {
                  'clientcert': false,
                  'TLS': false
                },
                'resources': {
                  'vhost': 'eslap://eslap.cloud/resources/vhost/monitor',
                  'server_cert': null
                }
              },
              'interconnection': true,
              'roles': {
                'sep': {
                  'resources': {
                    '__resilience': 1,
                    '__bandwidth': 1,
                    '__iopsintensive': false,
                    '__ioperf': 1,
                    '__memory': 1,
                    '__cpu': 1,
                    '__instances': 1
                  }
                }
              },
              'name': 'slap://eslap.cloud/deployments/20170503_070459/9df375a4',
              'service': {
                'connectors': [
                  {
                    'provided': [
                      {
                        'endpoint': 'frontend'
                      }
                    ],
                    'depended': [
                      {
                        'endpoint': 'sepsource',
                        'role': 'sep'
                      }
                    ],
                    'type': 'eslap://eslap.cloud/connector/loadbalancer/1_0_0'
                  }
                ],
                'channels': {
                  'provides': [],
                  'requires': [
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/endpoint/request/1_0_0',
                      'name': 'frontend'
                    }
                  ]
                },
                'roles': [
                  {
                    'parameters': {},
                    'resources': {},
                    'component': 'slap://slapdomain/components/httpsep/0_0_1',
                    'name': 'sep'
                  }
                ],
                'configuration': {
                  'parameters': [
                    {
                      'default': 'false',
                      'type': 'eslap://eslap.cloud/parameter/boolean/1_0_0',
                      'name': 'TLS'
                    },
                    {
                      'default': 'false',
                      'type': 'eslap://eslap.cloud/parameter/boolean/1_0_0',
                      'name': 'clientcert'
                    }
                  ],
                  'resources': [
                    {
                      'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                      'name': 'server_cert'
                    },
                    {
                      'type': 'eslap://eslap.cloud/resource/vhost/1_0_0',
                      'name': 'vhost'
                    }
                  ]
                },
                'name': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'components': {
                'slap://slapdomain/components/httpsep/0_0_1': {
                  'channels': {
                    'requires': [
                      {
                        'protocol': 'TBD',
                        'type': 'eslap://eslap.cloud/channel/request/1_0_0',
                        'name': 'sepsource'
                      }
                    ],
                    'provides': []
                  },
                  'profile': 'QoS profile. TBD',
                  'configuration': {
                    'parameters': [],
                    'resources': []
                  },
                  'code': '3e28a90e4a201181ca96f945dc54b59387489077',
                  'runtime': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'name': 'slap://slapdomain/components/httpsep/0_0_1',
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0'
                }
              }
            }
          },
          'SLA': 'TBD',
          'arrangement': {
            'sep': {
              'failurezones': 1,
              'bandwidth': 1,
              'memory': 1,
              'cpu': 1,
              'maxinstances': 1,
              '__instances': 1,
              '__cpu': 1,
              '__memory': 1,
              '__ioperf': 1,
              '__iopsintensive': false,
              '__bandwidth': 1,
              '__resilience': 1,
              'mininstances': 1
            }
          },
          'runtimes': {
            'slap://slapdomain/runtimes/managed/nodejs/0_0_1': {
              'name': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
              'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
            }
          },
          'resources': {
            'vhost': {
              'resource': {
                'parameters': {
                  'vhost': 'monitor-ticket740.slap53.iti.es'
                },
                'name': 'eslap://eslap.cloud/resources/vhost/monitor',
                'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
              },
              'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
            },
            'server_cert': {
              'resource': {
                'parameters': null
              },
              'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
              'locator': null
            }
          },
          'spec': 'slap://slapdomain/manifests/deployment/0_0_1',
          'servicename': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
          'name': 'slap://eslap.cloud/deployments/20170503_070459/9df375a4',
          'interconnection': true,
          'entrypoints': {
            'sep': {
              'instancespath': false,
              'domain': 'monitor-ticket740.slap53.iti.es',
              'sslonly': false,
              'secrets': {}
            }
          },
          'components-configuration': {
            'sep': {
              'domain': 'monitor-ticket740.slap53.iti.es',
              'sslonly': false,
              'secrets': {}
            },
            '__service': {
              'clientcert': false,
              'TLS': false
            }
          },
          'components-resources': {
            'sep': {},
            '__service': {
              'vhost': {
                'resource': {
                  'parameters': {
                    'vhost': 'monitor-ticket740.slap53.iti.es'
                  },
                  'name': 'eslap://eslap.cloud/resources/vhost/monitor',
                  'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                },
                'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
              },
              'server_cert': {
                'resource': {
                  'parameters': null
                },
                'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                'locator': null
              }
            }
          },
          'configuration': {
            'clientcert': false,
            'TLS': false
          }
        },
        'instanceList': {
          'eslap.cloud_sep_4': {
            'incnum': 1,
            'component': 'sep',
            'cnsocket': 'tcp://10.1.0.35:5310',
            'cnid': '84bea579-65d3-4752-82f9-67217c6d1666',
            'connected': true
          }
        },
        'involvedCNs': [
          {
            'initialResources': {
              'disk': 10,
              'bandwidth': 1000,
              'memory': 12,
              'cpu': 8
            },
            'size': 'm1.medium',
            'id': '84bea579-65d3-4752-82f9-67217c6d1666',
            'publicIp': '172.24.4.18',
            'privateIp': '10.1.0.35',
            'subnet': 'cb327f96-db68-4848-8a7e-1c565e263686',
            'net': '10dd0acf-137f-4024-8d40-1e9d433f4630',
            'zone': 'zone-0',
            'imageId': '9e3c665e-16c5-4825-afe4-d89867eaed19',
            'tags': {
              'slap': 'ticket740',
              'name': 'ticket740.cn'
            }
          }
        ]
      },
      'slap://eslap.cloud/deployments/20170503_070454/f2ab3137': {
        'manifest': {
          'owner': 'admin-eslap@iti.es',
          'components': {
            'slap://slapdomain/components/httpsep/0_0_1': {
              'required': {
                'sepsource': {
                  'protocol': 'TBD',
                  'channel_type': 'slap://slapdomain/endpoints/request'
                }
              },
              'provided': {},
              'spec': 'http://eslap.cloud/manifest/component/1_0_0',
              'name': 'slap://slapdomain/components/httpsep/0_0_1',
              'runtime': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
              'code': '3e28a90e4a201181ca96f945dc54b59387489077',
              'configuration': {},
              'resources': [],
              'external': 'TBD',
              'profile': 'QoS profile. TBD'
            }
          },
          'service': {
            'configuration_spread': {},
            'defaults': {},
            'configuration': {},
            'connectors': [
              {
                'providers': [],
                'dependents': [
                  {
                    'channel': 'sepsource',
                    'component': 'sep'
                  }
                ],
                'type': 'slap://slapdomain/connectors/lb'
              }
            ],
            'components': {
              'sep': 'slap://slapdomain/components/httpsep/0_0_1'
            },
            'name': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
            'spec': 'http://eslap.cloud/manifest/service/1_0_0'
          },
          'versions': {
            'http://eslap.cloud/manifest/deployment/1_0_0': {
              'owner': 'admin-eslap@iti.es',
              'components-resources': {
                'sep': {},
                '__service': {
                  'vhost': {
                    'resource': {
                      'parameters': {
                        'vhost': 'admission-ticket740.slap53.iti.es'
                      },
                      'name': 'eslap://eslap.cloud/resources/vhost/admission',
                      'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                    },
                    'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'server_cert': {
                    'resource': {
                      'parameters': null
                    },
                    'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                    'locator': null
                  }
                }
              },
              'components-configuration': {
                'sep': {},
                '__service': {
                  'clientcert': false,
                  'TLS': false
                }
              },
              'resources': {
                'vhost': {
                  'resource': {
                    'parameters': {
                      'vhost': 'admission-ticket740.slap53.iti.es'
                    },
                    'name': 'eslap://eslap.cloud/resources/vhost/admission',
                    'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                },
                'server_cert': {
                  'resource': {
                    'parameters': null
                  },
                  'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                  'locator': null
                }
              },
              'runtimes': {
                'slap://slapdomain/runtimes/managed/nodejs/0_0_1': {
                  'name': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'spec': 'http://eslap.cloud/manifest/deployment/1_0_0',
              'servicename': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
              'configuration': {
                'parameters': {
                  'clientcert': false,
                  'TLS': false
                },
                'resources': {
                  'vhost': 'eslap://eslap.cloud/resources/vhost/admission',
                  'server_cert': null
                }
              },
              'interconnection': true,
              'roles': {
                'sep': {
                  'resources': {
                    '__resilience': 1,
                    '__bandwidth': 1,
                    '__iopsintensive': false,
                    '__ioperf': 1,
                    '__memory': 1,
                    '__cpu': 1,
                    '__instances': 1
                  }
                }
              },
              'name': 'slap://eslap.cloud/deployments/20170503_070454/f2ab3137',
              'service': {
                'connectors': [
                  {
                    'provided': [
                      {
                        'endpoint': 'frontend'
                      }
                    ],
                    'depended': [
                      {
                        'endpoint': 'sepsource',
                        'role': 'sep'
                      }
                    ],
                    'type': 'eslap://eslap.cloud/connector/loadbalancer/1_0_0'
                  }
                ],
                'channels': {
                  'provides': [],
                  'requires': [
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/endpoint/request/1_0_0',
                      'name': 'frontend'
                    }
                  ]
                },
                'roles': [
                  {
                    'parameters': {},
                    'resources': {},
                    'component': 'slap://slapdomain/components/httpsep/0_0_1',
                    'name': 'sep'
                  }
                ],
                'configuration': {
                  'parameters': [
                    {
                      'default': 'false',
                      'type': 'eslap://eslap.cloud/parameter/boolean/1_0_0',
                      'name': 'TLS'
                    },
                    {
                      'default': 'false',
                      'type': 'eslap://eslap.cloud/parameter/boolean/1_0_0',
                      'name': 'clientcert'
                    }
                  ],
                  'resources': [
                    {
                      'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                      'name': 'server_cert'
                    },
                    {
                      'type': 'eslap://eslap.cloud/resource/vhost/1_0_0',
                      'name': 'vhost'
                    }
                  ]
                },
                'name': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'components': {
                'slap://slapdomain/components/httpsep/0_0_1': {
                  'channels': {
                    'requires': [
                      {
                        'protocol': 'TBD',
                        'type': 'eslap://eslap.cloud/channel/request/1_0_0',
                        'name': 'sepsource'
                      }
                    ],
                    'provides': []
                  },
                  'profile': 'QoS profile. TBD',
                  'configuration': {
                    'parameters': [],
                    'resources': []
                  },
                  'code': '3e28a90e4a201181ca96f945dc54b59387489077',
                  'runtime': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'name': 'slap://slapdomain/components/httpsep/0_0_1',
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0'
                }
              }
            },
            'slap://slapdomain/manifests/deployment/0_0_1': {
              'owner': 'admin-eslap@iti.es',
              'components': {
                'slap://slapdomain/components/httpsep/0_0_1': {
                  'required': {
                    'sepsource': {
                      'protocol': 'TBD',
                      'channel_type': 'slap://slapdomain/endpoints/request'
                    }
                  },
                  'provided': {},
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0',
                  'name': 'slap://slapdomain/components/httpsep/0_0_1',
                  'runtime': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'code': '3e28a90e4a201181ca96f945dc54b59387489077',
                  'configuration': {},
                  'resources': [],
                  'external': 'TBD',
                  'profile': 'QoS profile. TBD'
                }
              },
              'service': {
                'configuration_spread': {},
                'defaults': {},
                'configuration': {},
                'connectors': [
                  {
                    'providers': [],
                    'dependents': [
                      {
                        'channel': 'sepsource',
                        'component': 'sep'
                      }
                    ],
                    'type': 'slap://slapdomain/connectors/lb'
                  }
                ],
                'components': {
                  'sep': 'slap://slapdomain/components/httpsep/0_0_1'
                },
                'name': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'SLA': 'TBD',
              'arrangement': {
                'sep': {
                  'failurezones': 1,
                  'bandwidth': 1,
                  'memory': 1,
                  'cpu': 1,
                  'maxinstances': 1,
                  '__instances': 1,
                  '__cpu': 1,
                  '__memory': 1,
                  '__ioperf': 1,
                  '__iopsintensive': false,
                  '__bandwidth': 1,
                  '__resilience': 1,
                  'mininstances': 1
                }
              },
              'runtimes': {
                'slap://slapdomain/runtimes/managed/nodejs/0_0_1': {
                  'name': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'resources': {
                'vhost': {
                  'resource': {
                    'parameters': {
                      'vhost': 'admission-ticket740.slap53.iti.es'
                    },
                    'name': 'eslap://eslap.cloud/resources/vhost/admission',
                    'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                },
                'server_cert': {
                  'resource': {
                    'parameters': null
                  },
                  'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                  'locator': null
                }
              },
              'spec': 'slap://slapdomain/manifests/deployment/0_0_1',
              'servicename': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
              'name': 'slap://eslap.cloud/deployments/20170503_070454/f2ab3137',
              'interconnection': true,
              'entrypoints': {
                'sep': {
                  'instancespath': false,
                  'domain': 'admission-ticket740.slap53.iti.es',
                  'sslonly': false,
                  'secrets': {}
                }
              },
              'components-configuration': {
                'sep': {
                  'domain': 'admission-ticket740.slap53.iti.es',
                  'sslonly': false,
                  'secrets': {}
                },
                '__service': {
                  'clientcert': false,
                  'TLS': false
                }
              },
              'components-resources': {
                'sep': {},
                '__service': {
                  'vhost': {
                    'resource': {
                      'parameters': {
                        'vhost': 'admission-ticket740.slap53.iti.es'
                      },
                      'name': 'eslap://eslap.cloud/resources/vhost/admission',
                      'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                    },
                    'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'server_cert': {
                    'resource': {
                      'parameters': null
                    },
                    'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                    'locator': null
                  }
                }
              },
              'configuration': {
                'clientcert': false,
                'TLS': false
              }
            },
            'http://eslap.cloud/manifest/deployment/1_0_0_CLASSIC': {
              'owner': 'admin-eslap@iti.es',
              'components-resources': {
                'sep': {},
                '__service': {
                  'vhost': {
                    'resource': {
                      'parameters': {
                        'vhost': 'admission-ticket740.slap53.iti.es'
                      },
                      'name': 'eslap://eslap.cloud/resources/vhost/admission',
                      'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                    },
                    'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'server_cert': {
                    'resource': {
                      'parameters': null
                    },
                    'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                    'locator': null
                  }
                }
              },
              'components-configuration': {
                'sep': {},
                '__service': {
                  'clientcert': false,
                  'TLS': false
                }
              },
              'resources': {
                'vhost': {
                  'resource': {
                    'parameters': {
                      'vhost': 'admission-ticket740.slap53.iti.es'
                    },
                    'name': 'eslap://eslap.cloud/resources/vhost/admission',
                    'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                },
                'server_cert': {
                  'resource': {
                    'parameters': null
                  },
                  'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                  'locator': null
                }
              },
              'runtimes': {
                'slap://slapdomain/runtimes/managed/nodejs/0_0_1': {
                  'name': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'spec': 'http://eslap.cloud/manifest/deployment/1_0_0',
              'servicename': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
              'configuration': {
                'parameters': {
                  'clientcert': false,
                  'TLS': false
                },
                'resources': {
                  'vhost': 'eslap://eslap.cloud/resources/vhost/admission',
                  'server_cert': null
                }
              },
              'interconnection': true,
              'roles': {
                'sep': {
                  'resources': {
                    '__resilience': 1,
                    '__bandwidth': 1,
                    '__iopsintensive': false,
                    '__ioperf': 1,
                    '__memory': 1,
                    '__cpu': 1,
                    '__instances': 1
                  }
                }
              },
              'name': 'slap://eslap.cloud/deployments/20170503_070454/f2ab3137',
              'service': {
                'connectors': [
                  {
                    'provided': [
                      {
                        'endpoint': 'frontend'
                      }
                    ],
                    'depended': [
                      {
                        'endpoint': 'sepsource',
                        'role': 'sep'
                      }
                    ],
                    'type': 'eslap://eslap.cloud/connector/loadbalancer/1_0_0'
                  }
                ],
                'channels': {
                  'provides': [],
                  'requires': [
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/endpoint/request/1_0_0',
                      'name': 'frontend'
                    }
                  ]
                },
                'roles': [
                  {
                    'parameters': {},
                    'resources': {},
                    'component': 'slap://slapdomain/components/httpsep/0_0_1',
                    'name': 'sep'
                  }
                ],
                'configuration': {
                  'parameters': [
                    {
                      'default': 'false',
                      'type': 'eslap://eslap.cloud/parameter/boolean/1_0_0',
                      'name': 'TLS'
                    },
                    {
                      'default': 'false',
                      'type': 'eslap://eslap.cloud/parameter/boolean/1_0_0',
                      'name': 'clientcert'
                    }
                  ],
                  'resources': [
                    {
                      'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                      'name': 'server_cert'
                    },
                    {
                      'type': 'eslap://eslap.cloud/resource/vhost/1_0_0',
                      'name': 'vhost'
                    }
                  ]
                },
                'name': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'components': {
                'slap://slapdomain/components/httpsep/0_0_1': {
                  'channels': {
                    'requires': [
                      {
                        'protocol': 'TBD',
                        'type': 'eslap://eslap.cloud/channel/request/1_0_0',
                        'name': 'sepsource'
                      }
                    ],
                    'provides': []
                  },
                  'profile': 'QoS profile. TBD',
                  'configuration': {
                    'parameters': [],
                    'resources': []
                  },
                  'code': '3e28a90e4a201181ca96f945dc54b59387489077',
                  'runtime': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'name': 'slap://slapdomain/components/httpsep/0_0_1',
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0'
                }
              }
            }
          },
          'SLA': 'TBD',
          'arrangement': {
            'sep': {
              'failurezones': 1,
              'bandwidth': 1,
              'memory': 1,
              'cpu': 1,
              'maxinstances': 1,
              '__instances': 1,
              '__cpu': 1,
              '__memory': 1,
              '__ioperf': 1,
              '__iopsintensive': false,
              '__bandwidth': 1,
              '__resilience': 1,
              'mininstances': 1
            }
          },
          'runtimes': {
            'slap://slapdomain/runtimes/managed/nodejs/0_0_1': {
              'name': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
              'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
            }
          },
          'resources': {
            'vhost': {
              'resource': {
                'parameters': {
                  'vhost': 'admission-ticket740.slap53.iti.es'
                },
                'name': 'eslap://eslap.cloud/resources/vhost/admission',
                'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
              },
              'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
            },
            'server_cert': {
              'resource': {
                'parameters': null
              },
              'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
              'locator': null
            }
          },
          'spec': 'slap://slapdomain/manifests/deployment/0_0_1',
          'servicename': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
          'name': 'slap://eslap.cloud/deployments/20170503_070454/f2ab3137',
          'interconnection': true,
          'entrypoints': {
            'sep': {
              'instancespath': false,
              'domain': 'admission-ticket740.slap53.iti.es',
              'sslonly': false,
              'secrets': {}
            }
          },
          'components-configuration': {
            'sep': {
              'domain': 'admission-ticket740.slap53.iti.es',
              'sslonly': false,
              'secrets': {}
            },
            '__service': {
              'clientcert': false,
              'TLS': false
            }
          },
          'components-resources': {
            'sep': {},
            '__service': {
              'vhost': {
                'resource': {
                  'parameters': {
                    'vhost': 'admission-ticket740.slap53.iti.es'
                  },
                  'name': 'eslap://eslap.cloud/resources/vhost/admission',
                  'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                },
                'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
              },
              'server_cert': {
                'resource': {
                  'parameters': null
                },
                'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                'locator': null
              }
            }
          },
          'configuration': {
            'clientcert': false,
            'TLS': false
          }
        },
        'instanceList': {
          'eslap.cloud_sep_3': {
            'incnum': 1,
            'component': 'sep',
            'cnsocket': 'tcp://10.1.0.35:5310',
            'cnid': '84bea579-65d3-4752-82f9-67217c6d1666',
            'connected': true
          }
        },
        'involvedCNs': [
          {
            'initialResources': {
              'disk': 10,
              'bandwidth': 1000,
              'memory': 12,
              'cpu': 8
            },
            'size': 'm1.medium',
            'id': '84bea579-65d3-4752-82f9-67217c6d1666',
            'publicIp': '172.24.4.18',
            'privateIp': '10.1.0.35',
            'subnet': 'cb327f96-db68-4848-8a7e-1c565e263686',
            'net': '10dd0acf-137f-4024-8d40-1e9d433f4630',
            'zone': 'zone-0',
            'imageId': '9e3c665e-16c5-4825-afe4-d89867eaed19',
            'tags': {
              'slap': 'ticket740',
              'name': 'ticket740.cn'
            }
          }
        ]
      },
      'slap://eslap.cloud/deployments/20170503_070449/0ad2957b': {
        'manifest': {
          'owner': 'admin-eslap@iti.es',
          'components': {
            'slap://slapdomain/components/httpsep/0_0_1': {
              'required': {
                'sepsource': {
                  'protocol': 'TBD',
                  'channel_type': 'slap://slapdomain/endpoints/request'
                }
              },
              'provided': {},
              'spec': 'http://eslap.cloud/manifest/component/1_0_0',
              'name': 'slap://slapdomain/components/httpsep/0_0_1',
              'runtime': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
              'code': '3e28a90e4a201181ca96f945dc54b59387489077',
              'configuration': {},
              'resources': [],
              'external': 'TBD',
              'profile': 'QoS profile. TBD'
            }
          },
          'service': {
            'configuration_spread': {},
            'defaults': {},
            'configuration': {},
            'connectors': [
              {
                'providers': [],
                'dependents': [
                  {
                    'channel': 'sepsource',
                    'component': 'sep'
                  }
                ],
                'type': 'slap://slapdomain/connectors/lb'
              }
            ],
            'components': {
              'sep': 'slap://slapdomain/components/httpsep/0_0_1'
            },
            'name': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
            'spec': 'http://eslap.cloud/manifest/service/1_0_0'
          },
          'versions': {
            'http://eslap.cloud/manifest/deployment/1_0_0': {
              'owner': 'admin-eslap@iti.es',
              'components-resources': {
                'sep': {},
                '__service': {
                  'vhost': {
                    'resource': {
                      'parameters': {
                        'vhost': 'acs-ticket740.slap53.iti.es'
                      },
                      'name': 'eslap://eslap.cloud/resources/vhost/acs',
                      'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                    },
                    'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'server_cert': {
                    'resource': {
                      'parameters': null
                    },
                    'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                    'locator': null
                  }
                }
              },
              'components-configuration': {
                'sep': {},
                '__service': {
                  'clientcert': false,
                  'TLS': false
                }
              },
              'resources': {
                'vhost': {
                  'resource': {
                    'parameters': {
                      'vhost': 'acs-ticket740.slap53.iti.es'
                    },
                    'name': 'eslap://eslap.cloud/resources/vhost/acs',
                    'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                },
                'server_cert': {
                  'resource': {
                    'parameters': null
                  },
                  'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                  'locator': null
                }
              },
              'runtimes': {
                'slap://slapdomain/runtimes/managed/nodejs/0_0_1': {
                  'name': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'spec': 'http://eslap.cloud/manifest/deployment/1_0_0',
              'servicename': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
              'configuration': {
                'parameters': {
                  'clientcert': false,
                  'TLS': false
                },
                'resources': {
                  'vhost': 'eslap://eslap.cloud/resources/vhost/acs',
                  'server_cert': null
                }
              },
              'interconnection': true,
              'roles': {
                'sep': {
                  'resources': {
                    '__resilience': 1,
                    '__bandwidth': 1,
                    '__iopsintensive': false,
                    '__ioperf': 1,
                    '__memory': 1,
                    '__cpu': 1,
                    '__instances': 1
                  }
                }
              },
              'name': 'slap://eslap.cloud/deployments/20170503_070449/0ad2957b',
              'service': {
                'connectors': [
                  {
                    'provided': [
                      {
                        'endpoint': 'frontend'
                      }
                    ],
                    'depended': [
                      {
                        'endpoint': 'sepsource',
                        'role': 'sep'
                      }
                    ],
                    'type': 'eslap://eslap.cloud/connector/loadbalancer/1_0_0'
                  }
                ],
                'channels': {
                  'provides': [],
                  'requires': [
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/endpoint/request/1_0_0',
                      'name': 'frontend'
                    }
                  ]
                },
                'roles': [
                  {
                    'parameters': {},
                    'resources': {},
                    'component': 'slap://slapdomain/components/httpsep/0_0_1',
                    'name': 'sep'
                  }
                ],
                'configuration': {
                  'parameters': [
                    {
                      'default': 'false',
                      'type': 'eslap://eslap.cloud/parameter/boolean/1_0_0',
                      'name': 'TLS'
                    },
                    {
                      'default': 'false',
                      'type': 'eslap://eslap.cloud/parameter/boolean/1_0_0',
                      'name': 'clientcert'
                    }
                  ],
                  'resources': [
                    {
                      'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                      'name': 'server_cert'
                    },
                    {
                      'type': 'eslap://eslap.cloud/resource/vhost/1_0_0',
                      'name': 'vhost'
                    }
                  ]
                },
                'name': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'components': {
                'slap://slapdomain/components/httpsep/0_0_1': {
                  'channels': {
                    'requires': [
                      {
                        'protocol': 'TBD',
                        'type': 'eslap://eslap.cloud/channel/request/1_0_0',
                        'name': 'sepsource'
                      }
                    ],
                    'provides': []
                  },
                  'profile': 'QoS profile. TBD',
                  'configuration': {
                    'parameters': [],
                    'resources': []
                  },
                  'code': '3e28a90e4a201181ca96f945dc54b59387489077',
                  'runtime': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'name': 'slap://slapdomain/components/httpsep/0_0_1',
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0'
                }
              }
            },
            'slap://slapdomain/manifests/deployment/0_0_1': {
              'owner': 'admin-eslap@iti.es',
              'components': {
                'slap://slapdomain/components/httpsep/0_0_1': {
                  'required': {
                    'sepsource': {
                      'protocol': 'TBD',
                      'channel_type': 'slap://slapdomain/endpoints/request'
                    }
                  },
                  'provided': {},
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0',
                  'name': 'slap://slapdomain/components/httpsep/0_0_1',
                  'runtime': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'code': '3e28a90e4a201181ca96f945dc54b59387489077',
                  'configuration': {},
                  'resources': [],
                  'external': 'TBD',
                  'profile': 'QoS profile. TBD'
                }
              },
              'service': {
                'configuration_spread': {},
                'defaults': {},
                'configuration': {},
                'connectors': [
                  {
                    'providers': [],
                    'dependents': [
                      {
                        'channel': 'sepsource',
                        'component': 'sep'
                      }
                    ],
                    'type': 'slap://slapdomain/connectors/lb'
                  }
                ],
                'components': {
                  'sep': 'slap://slapdomain/components/httpsep/0_0_1'
                },
                'name': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'SLA': 'TBD',
              'arrangement': {
                'sep': {
                  'failurezones': 1,
                  'bandwidth': 1,
                  'memory': 1,
                  'cpu': 1,
                  'maxinstances': 1,
                  '__instances': 1,
                  '__cpu': 1,
                  '__memory': 1,
                  '__ioperf': 1,
                  '__iopsintensive': false,
                  '__bandwidth': 1,
                  '__resilience': 1,
                  'mininstances': 1
                }
              },
              'runtimes': {
                'slap://slapdomain/runtimes/managed/nodejs/0_0_1': {
                  'name': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'resources': {
                'vhost': {
                  'resource': {
                    'parameters': {
                      'vhost': 'acs-ticket740.slap53.iti.es'
                    },
                    'name': 'eslap://eslap.cloud/resources/vhost/acs',
                    'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                },
                'server_cert': {
                  'resource': {
                    'parameters': null
                  },
                  'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                  'locator': null
                }
              },
              'spec': 'slap://slapdomain/manifests/deployment/0_0_1',
              'servicename': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
              'name': 'slap://eslap.cloud/deployments/20170503_070449/0ad2957b',
              'interconnection': true,
              'entrypoints': {
                'sep': {
                  'instancespath': false,
                  'domain': 'acs-ticket740.slap53.iti.es',
                  'sslonly': false,
                  'secrets': {}
                }
              },
              'components-configuration': {
                'sep': {
                  'domain': 'acs-ticket740.slap53.iti.es',
                  'sslonly': false,
                  'secrets': {}
                },
                '__service': {
                  'clientcert': false,
                  'TLS': false
                }
              },
              'components-resources': {
                'sep': {},
                '__service': {
                  'vhost': {
                    'resource': {
                      'parameters': {
                        'vhost': 'acs-ticket740.slap53.iti.es'
                      },
                      'name': 'eslap://eslap.cloud/resources/vhost/acs',
                      'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                    },
                    'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'server_cert': {
                    'resource': {
                      'parameters': null
                    },
                    'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                    'locator': null
                  }
                }
              },
              'configuration': {
                'clientcert': false,
                'TLS': false
              }
            },
            'http://eslap.cloud/manifest/deployment/1_0_0_CLASSIC': {
              'owner': 'admin-eslap@iti.es',
              'components-resources': {
                'sep': {},
                '__service': {
                  'vhost': {
                    'resource': {
                      'parameters': {
                        'vhost': 'acs-ticket740.slap53.iti.es'
                      },
                      'name': 'eslap://eslap.cloud/resources/vhost/acs',
                      'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                    },
                    'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'server_cert': {
                    'resource': {
                      'parameters': null
                    },
                    'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                    'locator': null
                  }
                }
              },
              'components-configuration': {
                'sep': {},
                '__service': {
                  'clientcert': false,
                  'TLS': false
                }
              },
              'resources': {
                'vhost': {
                  'resource': {
                    'parameters': {
                      'vhost': 'acs-ticket740.slap53.iti.es'
                    },
                    'name': 'eslap://eslap.cloud/resources/vhost/acs',
                    'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                  },
                  'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                },
                'server_cert': {
                  'resource': {
                    'parameters': null
                  },
                  'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                  'locator': null
                }
              },
              'runtimes': {
                'slap://slapdomain/runtimes/managed/nodejs/0_0_1': {
                  'name': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'spec': 'http://eslap.cloud/manifest/deployment/1_0_0',
              'servicename': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
              'configuration': {
                'parameters': {
                  'clientcert': false,
                  'TLS': false
                },
                'resources': {
                  'vhost': 'eslap://eslap.cloud/resources/vhost/acs',
                  'server_cert': null
                }
              },
              'interconnection': true,
              'roles': {
                'sep': {
                  'resources': {
                    '__resilience': 1,
                    '__bandwidth': 1,
                    '__iopsintensive': false,
                    '__ioperf': 1,
                    '__memory': 1,
                    '__cpu': 1,
                    '__instances': 1
                  }
                }
              },
              'name': 'slap://eslap.cloud/deployments/20170503_070449/0ad2957b',
              'service': {
                'connectors': [
                  {
                    'provided': [
                      {
                        'endpoint': 'frontend'
                      }
                    ],
                    'depended': [
                      {
                        'endpoint': 'sepsource',
                        'role': 'sep'
                      }
                    ],
                    'type': 'eslap://eslap.cloud/connector/loadbalancer/1_0_0'
                  }
                ],
                'channels': {
                  'provides': [],
                  'requires': [
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/endpoint/request/1_0_0',
                      'name': 'frontend'
                    }
                  ]
                },
                'roles': [
                  {
                    'parameters': {},
                    'resources': {},
                    'component': 'slap://slapdomain/components/httpsep/0_0_1',
                    'name': 'sep'
                  }
                ],
                'configuration': {
                  'parameters': [
                    {
                      'default': 'false',
                      'type': 'eslap://eslap.cloud/parameter/boolean/1_0_0',
                      'name': 'TLS'
                    },
                    {
                      'default': 'false',
                      'type': 'eslap://eslap.cloud/parameter/boolean/1_0_0',
                      'name': 'clientcert'
                    }
                  ],
                  'resources': [
                    {
                      'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                      'name': 'server_cert'
                    },
                    {
                      'type': 'eslap://eslap.cloud/resource/vhost/1_0_0',
                      'name': 'vhost'
                    }
                  ]
                },
                'name': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'components': {
                'slap://slapdomain/components/httpsep/0_0_1': {
                  'channels': {
                    'requires': [
                      {
                        'protocol': 'TBD',
                        'type': 'eslap://eslap.cloud/channel/request/1_0_0',
                        'name': 'sepsource'
                      }
                    ],
                    'provides': []
                  },
                  'profile': 'QoS profile. TBD',
                  'configuration': {
                    'parameters': [],
                    'resources': []
                  },
                  'code': '3e28a90e4a201181ca96f945dc54b59387489077',
                  'runtime': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
                  'name': 'slap://slapdomain/components/httpsep/0_0_1',
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0'
                }
              }
            }
          },
          'SLA': 'TBD',
          'arrangement': {
            'sep': {
              'failurezones': 1,
              'bandwidth': 1,
              'memory': 1,
              'cpu': 1,
              'maxinstances': 1,
              '__instances': 1,
              '__cpu': 1,
              '__memory': 1,
              '__ioperf': 1,
              '__iopsintensive': false,
              '__bandwidth': 1,
              '__resilience': 1,
              'mininstances': 1
            }
          },
          'runtimes': {
            'slap://slapdomain/runtimes/managed/nodejs/0_0_1': {
              'name': 'slap://slapdomain/runtimes/managed/nodejs/0_0_1',
              'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
            }
          },
          'resources': {
            'vhost': {
              'resource': {
                'parameters': {
                  'vhost': 'acs-ticket740.slap53.iti.es'
                },
                'name': 'eslap://eslap.cloud/resources/vhost/acs',
                'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
              },
              'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
            },
            'server_cert': {
              'resource': {
                'parameters': null
              },
              'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
              'locator': null
            }
          },
          'spec': 'slap://slapdomain/manifests/deployment/0_0_1',
          'servicename': 'eslap://eslap.cloud/services/http/inbound/1_0_0',
          'name': 'slap://eslap.cloud/deployments/20170503_070449/0ad2957b',
          'interconnection': true,
          'entrypoints': {
            'sep': {
              'instancespath': false,
              'domain': 'acs-ticket740.slap53.iti.es',
              'sslonly': false,
              'secrets': {}
            }
          },
          'components-configuration': {
            'sep': {
              'domain': 'acs-ticket740.slap53.iti.es',
              'sslonly': false,
              'secrets': {}
            },
            '__service': {
              'clientcert': false,
              'TLS': false
            }
          },
          'components-resources': {
            'sep': {},
            '__service': {
              'vhost': {
                'resource': {
                  'parameters': {
                    'vhost': 'acs-ticket740.slap53.iti.es'
                  },
                  'name': 'eslap://eslap.cloud/resources/vhost/acs',
                  'spec': 'eslap://eslap.cloud/resource/vhost/1_0_0'
                },
                'type': 'eslap://eslap.cloud/resource/vhost/1_0_0'
              },
              'server_cert': {
                'resource': {
                  'parameters': null
                },
                'type': 'slap//eslap.cloud/resource/cert/server/1_0_0',
                'locator': null
              }
            }
          },
          'configuration': {
            'clientcert': false,
            'TLS': false
          }
        },
        'instanceList': {
          'eslap.cloud_sep_2': {
            'incnum': 1,
            'component': 'sep',
            'cnsocket': 'tcp://10.1.0.35:5310',
            'cnid': '84bea579-65d3-4752-82f9-67217c6d1666',
            'connected': true
          }
        },
        'involvedCNs': [
          {
            'initialResources': {
              'disk': 10,
              'bandwidth': 1000,
              'memory': 12,
              'cpu': 8
            },
            'size': 'm1.medium',
            'id': '84bea579-65d3-4752-82f9-67217c6d1666',
            'publicIp': '172.24.4.18',
            'privateIp': '10.1.0.35',
            'subnet': 'cb327f96-db68-4848-8a7e-1c565e263686',
            'net': '10dd0acf-137f-4024-8d40-1e9d433f4630',
            'zone': 'zone-0',
            'imageId': '9e3c665e-16c5-4825-afe4-d89867eaed19',
            'tags': {
              'slap': 'ticket740',
              'name': 'ticket740.cn'
            }
          }
        ]
      },
      'slap://eslap.cloud/deployments/20170503_070445/2cc42dc8': {
        'manifest': {
          'owner': 'admin-eslap@iti.es',
          'components': {
            'eslap://eslap.cloud/components/admission/1_0_0': {
              'required': {
                'planner': {
                  'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                  'channel_type': 'slap://slapdomain/endpoints/request'
                },
                'acs': {
                  'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                  'channel_type': 'slap://slapdomain/endpoints/request'
                }
              },
              'provided': {
                'sepdest': {
                  'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                  'channel_type': 'slap://slapdomain/endpoints/reply'
                }
              },
              'profile': {
                'threadability': '*'
              },
              'spec': 'http://eslap.cloud/manifest/component/1_0_0',
              'name': 'eslap://eslap.cloud/components/admission/1_0_0',
              'runtime': 'eslap://eslap.cloud/runtime/native/dev/privileged/1_0_1',
              'code': '486cb4155c7fd02b3552b2cc6089cc7585d8ce9a',
              'codelocator': 'eslap://eslap.cloud/components/admission/1_0_0/image.tgz',
              'configuration': {
                'config': 'string'
              },
              'resources': [],
              'external': 'TBD'
            }
          },
          'service': {
            'configuration_spread': {},
            'defaults': {},
            'configuration': {},
            'connectors': [
              {
                'providers': [
                  {
                    'channel': 'sepdest',
                    'component': 'admission'
                  }
                ],
                'dependents': [
                  {
                    'channel': 'sepsource'
                  }
                ],
                'type': 'slap://slapdomain/connectors/lb'
              },
              {
                'providers': [],
                'dependents': [
                  {
                    'channel': 'acs',
                    'component': 'admission'
                  }
                ],
                'type': 'slap://slapdomain/connectors/lb'
              },
              {
                'providers': [],
                'dependents': [
                  {
                    'channel': 'planner',
                    'component': 'admission'
                  }
                ],
                'type': 'slap://slapdomain/connectors/lb'
              }
            ],
            'components': {
              'admission': 'eslap://eslap.cloud/components/admission/1_0_0'
            },
            'name': 'eslap://eslap.cloud/services/admission/1_0_0',
            'spec': 'http://eslap.cloud/manifest/service/1_0_0'
          },
          'versions': {
            'http://eslap.cloud/manifest/deployment/1_0_0': {
              'owner': 'admin-eslap@iti.es',
              'components-resources': {
                'admission': {},
                '__service': {}
              },
              'components-configuration': {
                'admission': {
                  'config': {
                    'domains': {
                      'random': {
                        'sufixNumbers': 4,
                        'words': 2,
                        'join': '-',
                        'prefix': ''
                      },
                      'refDomain': 'slap53.iti.es'
                    },
                    'server': {
                      'port': 8080
                    },
                    'planner': {
                      'plannerDomain': 'stamp-ticket740.slap53.iti.es',
                      'mockPlanner': false,
                      'addresses': [
                        '10.1.0.37'
                      ]
                    },
                    'manifestRepository': {
                      'config': {
                        'localImageStore': {
                          'imageFilename': 'manifest.json',
                          'path': '/slap/storage/local'
                        },
                        'remoteImageStore': {
                          'imageFilename': 'manifest.json',
                          'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                        }
                      },
                      'type': 'rsync'
                    },
                    'imageFetcher': {
                      'config': {
                        'localImageStore': {
                          'imageFilename': 'image.tgz',
                          'path': '/slap/storage/local'
                        },
                        'remoteImageStore': {
                          'imageFilename': 'image.tgz',
                          'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                        }
                      },
                      'type': 'blob'
                    },
                    'acs': {
                      'anonymous-user': {
                        'roles': [
                          'ADMIN'
                        ],
                        'id': 'admin-eslap@iti.es'
                      }
                    }
                  }
                },
                '__service': {
                  'admission': {
                    'config': {
                      'domains': {
                        'random': {
                          'sufixNumbers': 4,
                          'words': 2,
                          'join': '-',
                          'prefix': ''
                        },
                        'refDomain': 'slap53.iti.es'
                      },
                      'server': {
                        'port': 8080
                      },
                      'planner': {
                        'plannerDomain': 'stamp-ticket740.slap53.iti.es',
                        'mockPlanner': false,
                        'addresses': [
                          '10.1.0.37'
                        ]
                      },
                      'manifestRepository': {
                        'config': {
                          'localImageStore': {
                            'imageFilename': 'manifest.json',
                            'path': '/slap/storage/local'
                          },
                          'remoteImageStore': {
                            'imageFilename': 'manifest.json',
                            'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                          }
                        },
                        'type': 'rsync'
                      },
                      'imageFetcher': {
                        'config': {
                          'localImageStore': {
                            'imageFilename': 'image.tgz',
                            'path': '/slap/storage/local'
                          },
                          'remoteImageStore': {
                            'imageFilename': 'image.tgz',
                            'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                          }
                        },
                        'type': 'blob'
                      },
                      'acs': {
                        'anonymous-user': {
                          'roles': [
                            'ADMIN'
                          ],
                          'id': 'admin-eslap@iti.es'
                        }
                      }
                    }
                  }
                }
              },
              'resources': {},
              'runtimes': {
                'eslap://eslap.cloud/runtime/native/dev/privileged/1_0_1': {
                  'metadata': {
                    'software': {
                      'libsodium': {
                        'version': '1.0.5'
                      },
                      'libzmq5': {
                        'version': '4.1.3'
                      },
                      'nodejs': {
                        'version': '4.3.2'
                      },
                      'ecloud-runtime-agent': {
                        'version': '1.0.0'
                      }
                    },
                    'os_release': 'Trusty Tahr',
                    'os_version': '14.04',
                    'os_name': 'Ubuntu',
                    'description': 'ECloud Ubuntu 14.04 Privileged'
                  },
                  'agent': 'eslap://eslap.cloud/runtime-agent/1_0_0',
                  'entrypoint': '/eslap/runtime-agent/scripts/start-runtime-agent.sh',
                  'sourcedir': '/eslap/component',
                  'derived': {
                    'from': 'eslap://eslap.cloud/runtime/native/1_0_1'
                  },
                  'name': 'eslap://eslap.cloud/runtime/native/dev/privileged/1_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'spec': 'http://eslap.cloud/manifest/deployment/1_0_0',
              'servicename': 'eslap://eslap.cloud/services/admission/1_0_0',
              'interconnection': true,
              'configuration': {
                'parameters': {
                  'admission': {
                    'config': {
                      'domains': {
                        'random': {
                          'sufixNumbers': 4,
                          'words': 2,
                          'join': '-',
                          'prefix': ''
                        },
                        'refDomain': 'slap53.iti.es'
                      },
                      'server': {
                        'port': 8080
                      },
                      'planner': {
                        'plannerDomain': 'stamp-ticket740.slap53.iti.es',
                        'mockPlanner': false,
                        'addresses': [
                          '10.1.0.37'
                        ]
                      },
                      'manifestRepository': {
                        'config': {
                          'localImageStore': {
                            'imageFilename': 'manifest.json',
                            'path': '/slap/storage/local'
                          },
                          'remoteImageStore': {
                            'imageFilename': 'manifest.json',
                            'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                          }
                        },
                        'type': 'rsync'
                      },
                      'imageFetcher': {
                        'config': {
                          'localImageStore': {
                            'imageFilename': 'image.tgz',
                            'path': '/slap/storage/local'
                          },
                          'remoteImageStore': {
                            'imageFilename': 'image.tgz',
                            'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                          }
                        },
                        'type': 'blob'
                      },
                      'acs': {
                        'anonymous-user': {
                          'roles': [
                            'ADMIN'
                          ],
                          'id': 'admin-eslap@iti.es'
                        }
                      }
                    }
                  }
                },
                'resources': {}
              },
              'roles': {
                'admission': {
                  'resources': {
                    '__resilience': 1,
                    '__bandwidth': 1,
                    '__iopsintensive': true,
                    '__ioperf': 2,
                    '__memory': 2,
                    '__cpu': 1,
                    '__instances': 1
                  }
                }
              },
              'name': 'slap://eslap.cloud/deployments/20170503_070445/2cc42dc8',
              'service': {
                'connectors': [
                  {
                    'provided': [
                      {
                        'endpoint': 'sepdest',
                        'role': 'admission'
                      }
                    ],
                    'depended': [
                      {
                        'endpoint': 'http-admission'
                      }
                    ],
                    'type': 'eslap://eslap.cloud/connector/loadbalancer/1_0_0'
                  },
                  {
                    'depended': [
                      {
                        'endpoint': 'acs',
                        'role': 'admission'
                      }
                    ],
                    'provided': [
                      {
                        'endpoint': 'service-acs'
                      }
                    ],
                    'type': 'eslap://eslap.cloud/connector/loadbalancer/1_0_0'
                  },
                  {
                    'depended': [
                      {
                        'endpoint': 'planner',
                        'role': 'admission'
                      }
                    ],
                    'provided': [
                      {
                        'endpoint': 'service-planner'
                      }
                    ],
                    'type': 'eslap://eslap.cloud/connector/loadbalancer/1_0_0'
                  }
                ],
                'channels': {
                  'provides': [
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/channel/reply/1_0_0',
                      'name': 'http-admission'
                    }
                  ],
                  'requires': [
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/channel/request/1_0_0',
                      'name': 'service-acs'
                    },
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/channel/request/1_0_0',
                      'name': 'service-planner'
                    }
                  ]
                },
                'roles': [
                  {
                    'parameters': {},
                    'resources': {},
                    'component': 'eslap://eslap.cloud/components/admission/1_0_0',
                    'name': 'admission'
                  }
                ],
                'configuration': {
                  'parameters': [
                    {
                      'type': 'eslap://eslap.cloud/parameter/json/1_0_0',
                      'name': 'admission'
                    }
                  ],
                  'resources': []
                },
                'name': 'eslap://eslap.cloud/services/admission/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'components': {
                'eslap://eslap.cloud/components/admission/1_0_0': {
                  'codelocator': 'eslap://eslap.cloud/components/admission/1_0_0/image.tgz',
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0',
                  'name': 'eslap://eslap.cloud/components/admission/1_0_0',
                  'runtime': 'eslap://eslap.cloud/runtime/native/dev/privileged/1_0_1',
                  'code': '486cb4155c7fd02b3552b2cc6089cc7585d8ce9a',
                  'channels': {
                    'provides': [
                      {
                        'name': 'sepdest',
                        'type': 'eslap://eslap.cloud/channel/reply/1_0_0',
                        'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0'
                      }
                    ],
                    'requires': [
                      {
                        'name': 'acs',
                        'type': 'eslap://eslap.cloud/channel/request/1_0_0',
                        'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0'
                      },
                      {
                        'name': 'planner',
                        'type': 'eslap://eslap.cloud/channel/request/1_0_0',
                        'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0'
                      }
                    ]
                  },
                  'configuration': {
                    'resources': [],
                    'parameters': [
                      {
                        'name': 'config',
                        'type': 'eslap://eslap.cloud/parameter/json/1_0_0'
                      }
                    ]
                  },
                  'profile': {
                    'threadability': '*'
                  }
                }
              }
            },
            'slap://slapdomain/manifests/deployment/0_0_1': {
              'owner': 'admin-eslap@iti.es',
              'components': {
                'eslap://eslap.cloud/components/admission/1_0_0': {
                  'required': {
                    'planner': {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'channel_type': 'slap://slapdomain/endpoints/request'
                    },
                    'acs': {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'channel_type': 'slap://slapdomain/endpoints/request'
                    }
                  },
                  'provided': {
                    'sepdest': {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'channel_type': 'slap://slapdomain/endpoints/reply'
                    }
                  },
                  'profile': {
                    'threadability': '*'
                  },
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0',
                  'name': 'eslap://eslap.cloud/components/admission/1_0_0',
                  'runtime': 'eslap://eslap.cloud/runtime/native/dev/privileged/1_0_1',
                  'code': '486cb4155c7fd02b3552b2cc6089cc7585d8ce9a',
                  'codelocator': 'eslap://eslap.cloud/components/admission/1_0_0/image.tgz',
                  'configuration': {
                    'config': 'string'
                  },
                  'resources': [],
                  'external': 'TBD'
                }
              },
              'service': {
                'configuration_spread': {},
                'defaults': {},
                'configuration': {},
                'connectors': [
                  {
                    'providers': [
                      {
                        'channel': 'sepdest',
                        'component': 'admission'
                      }
                    ],
                    'dependents': [
                      {
                        'channel': 'sepsource'
                      }
                    ],
                    'type': 'slap://slapdomain/connectors/lb'
                  },
                  {
                    'providers': [],
                    'dependents': [
                      {
                        'channel': 'acs',
                        'component': 'admission'
                      }
                    ],
                    'type': 'slap://slapdomain/connectors/lb'
                  },
                  {
                    'providers': [],
                    'dependents': [
                      {
                        'channel': 'planner',
                        'component': 'admission'
                      }
                    ],
                    'type': 'slap://slapdomain/connectors/lb'
                  }
                ],
                'components': {
                  'admission': 'eslap://eslap.cloud/components/admission/1_0_0'
                },
                'name': 'eslap://eslap.cloud/services/admission/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'SLA': 'TBD',
              'arrangement': {
                'admission': {
                  'failurezones': 1,
                  'bandwidth': 1,
                  'memory': 2,
                  'cpu': 1,
                  'maxinstances': 1,
                  '__instances': 1,
                  '__cpu': 1,
                  '__memory': 2,
                  '__ioperf': 2,
                  '__iopsintensive': true,
                  '__bandwidth': 1,
                  '__resilience': 1,
                  'mininstances': 1
                }
              },
              'runtimes': {
                'eslap://eslap.cloud/runtime/native/dev/privileged/1_0_1': {
                  'metadata': {
                    'software': {
                      'libsodium': {
                        'version': '1.0.5'
                      },
                      'libzmq5': {
                        'version': '4.1.3'
                      },
                      'nodejs': {
                        'version': '4.3.2'
                      },
                      'ecloud-runtime-agent': {
                        'version': '1.0.0'
                      }
                    },
                    'os_release': 'Trusty Tahr',
                    'os_version': '14.04',
                    'os_name': 'Ubuntu',
                    'description': 'ECloud Ubuntu 14.04 Privileged'
                  },
                  'agent': 'eslap://eslap.cloud/runtime-agent/1_0_0',
                  'entrypoint': '/eslap/runtime-agent/scripts/start-runtime-agent.sh',
                  'sourcedir': '/eslap/component',
                  'derived': {
                    'from': 'eslap://eslap.cloud/runtime/native/1_0_1'
                  },
                  'name': 'eslap://eslap.cloud/runtime/native/dev/privileged/1_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'resources': {},
              'spec': 'slap://slapdomain/manifests/deployment/0_0_1',
              'servicename': 'eslap://eslap.cloud/services/admission/1_0_0',
              'name': 'slap://eslap.cloud/deployments/20170503_070445/2cc42dc8',
              'interconnection': true,
              'entrypoints': {},
              'components-configuration': {
                'admission': {
                  'config': {
                    'domains': {
                      'random': {
                        'sufixNumbers': 4,
                        'words': 2,
                        'join': '-',
                        'prefix': ''
                      },
                      'refDomain': 'slap53.iti.es'
                    },
                    'server': {
                      'port': 8080
                    },
                    'planner': {
                      'plannerDomain': 'stamp-ticket740.slap53.iti.es',
                      'mockPlanner': false,
                      'addresses': [
                        '10.1.0.37'
                      ]
                    },
                    'manifestRepository': {
                      'config': {
                        'localImageStore': {
                          'imageFilename': 'manifest.json',
                          'path': '/slap/storage/local'
                        },
                        'remoteImageStore': {
                          'imageFilename': 'manifest.json',
                          'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                        }
                      },
                      'type': 'rsync'
                    },
                    'imageFetcher': {
                      'config': {
                        'localImageStore': {
                          'imageFilename': 'image.tgz',
                          'path': '/slap/storage/local'
                        },
                        'remoteImageStore': {
                          'imageFilename': 'image.tgz',
                          'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                        }
                      },
                      'type': 'blob'
                    },
                    'acs': {
                      'anonymous-user': {
                        'roles': [
                          'ADMIN'
                        ],
                        'id': 'admin-eslap@iti.es'
                      }
                    }
                  }
                },
                '__service': {
                  'admission': {
                    'config': {
                      'domains': {
                        'random': {
                          'sufixNumbers': 4,
                          'words': 2,
                          'join': '-',
                          'prefix': ''
                        },
                        'refDomain': 'slap53.iti.es'
                      },
                      'server': {
                        'port': 8080
                      },
                      'planner': {
                        'plannerDomain': 'stamp-ticket740.slap53.iti.es',
                        'mockPlanner': false,
                        'addresses': [
                          '10.1.0.37'
                        ]
                      },
                      'manifestRepository': {
                        'config': {
                          'localImageStore': {
                            'imageFilename': 'manifest.json',
                            'path': '/slap/storage/local'
                          },
                          'remoteImageStore': {
                            'imageFilename': 'manifest.json',
                            'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                          }
                        },
                        'type': 'rsync'
                      },
                      'imageFetcher': {
                        'config': {
                          'localImageStore': {
                            'imageFilename': 'image.tgz',
                            'path': '/slap/storage/local'
                          },
                          'remoteImageStore': {
                            'imageFilename': 'image.tgz',
                            'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                          }
                        },
                        'type': 'blob'
                      },
                      'acs': {
                        'anonymous-user': {
                          'roles': [
                            'ADMIN'
                          ],
                          'id': 'admin-eslap@iti.es'
                        }
                      }
                    }
                  }
                }
              },
              'components-resources': {
                'admission': {},
                '__service': {}
              },
              'configuration': {
                'admission': {
                  'config': {
                    'domains': {
                      'random': {
                        'sufixNumbers': 4,
                        'words': 2,
                        'join': '-',
                        'prefix': ''
                      },
                      'refDomain': 'slap53.iti.es'
                    },
                    'server': {
                      'port': 8080
                    },
                    'planner': {
                      'plannerDomain': 'stamp-ticket740.slap53.iti.es',
                      'mockPlanner': false,
                      'addresses': [
                        '10.1.0.37'
                      ]
                    },
                    'manifestRepository': {
                      'config': {
                        'localImageStore': {
                          'imageFilename': 'manifest.json',
                          'path': '/slap/storage/local'
                        },
                        'remoteImageStore': {
                          'imageFilename': 'manifest.json',
                          'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                        }
                      },
                      'type': 'rsync'
                    },
                    'imageFetcher': {
                      'config': {
                        'localImageStore': {
                          'imageFilename': 'image.tgz',
                          'path': '/slap/storage/local'
                        },
                        'remoteImageStore': {
                          'imageFilename': 'image.tgz',
                          'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                        }
                      },
                      'type': 'blob'
                    },
                    'acs': {
                      'anonymous-user': {
                        'roles': [
                          'ADMIN'
                        ],
                        'id': 'admin-eslap@iti.es'
                      }
                    }
                  }
                }
              }
            },
            'http://eslap.cloud/manifest/deployment/1_0_0_CLASSIC': {
              'owner': 'admin-eslap@iti.es',
              'components-resources': {
                'admission': {},
                '__service': {}
              },
              'components-configuration': {
                'admission': {
                  'config': {
                    'domains': {
                      'random': {
                        'sufixNumbers': 4,
                        'words': 2,
                        'join': '-',
                        'prefix': ''
                      },
                      'refDomain': 'slap53.iti.es'
                    },
                    'server': {
                      'port': 8080
                    },
                    'planner': {
                      'plannerDomain': 'stamp-ticket740.slap53.iti.es',
                      'mockPlanner': false,
                      'addresses': [
                        '10.1.0.37'
                      ]
                    },
                    'manifestRepository': {
                      'config': {
                        'localImageStore': {
                          'imageFilename': 'manifest.json',
                          'path': '/slap/storage/local'
                        },
                        'remoteImageStore': {
                          'imageFilename': 'manifest.json',
                          'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                        }
                      },
                      'type': 'rsync'
                    },
                    'imageFetcher': {
                      'config': {
                        'localImageStore': {
                          'imageFilename': 'image.tgz',
                          'path': '/slap/storage/local'
                        },
                        'remoteImageStore': {
                          'imageFilename': 'image.tgz',
                          'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                        }
                      },
                      'type': 'blob'
                    },
                    'acs': {
                      'anonymous-user': {
                        'roles': [
                          'ADMIN'
                        ],
                        'id': 'admin-eslap@iti.es'
                      }
                    }
                  }
                },
                '__service': {
                  'admission': {
                    'config': {
                      'domains': {
                        'random': {
                          'sufixNumbers': 4,
                          'words': 2,
                          'join': '-',
                          'prefix': ''
                        },
                        'refDomain': 'slap53.iti.es'
                      },
                      'server': {
                        'port': 8080
                      },
                      'planner': {
                        'plannerDomain': 'stamp-ticket740.slap53.iti.es',
                        'mockPlanner': false,
                        'addresses': [
                          '10.1.0.37'
                        ]
                      },
                      'manifestRepository': {
                        'config': {
                          'localImageStore': {
                            'imageFilename': 'manifest.json',
                            'path': '/slap/storage/local'
                          },
                          'remoteImageStore': {
                            'imageFilename': 'manifest.json',
                            'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                          }
                        },
                        'type': 'rsync'
                      },
                      'imageFetcher': {
                        'config': {
                          'localImageStore': {
                            'imageFilename': 'image.tgz',
                            'path': '/slap/storage/local'
                          },
                          'remoteImageStore': {
                            'imageFilename': 'image.tgz',
                            'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                          }
                        },
                        'type': 'blob'
                      },
                      'acs': {
                        'anonymous-user': {
                          'roles': [
                            'ADMIN'
                          ],
                          'id': 'admin-eslap@iti.es'
                        }
                      }
                    }
                  }
                }
              },
              'resources': {},
              'runtimes': {
                'eslap://eslap.cloud/runtime/native/dev/privileged/1_0_1': {
                  'metadata': {
                    'software': {
                      'libsodium': {
                        'version': '1.0.5'
                      },
                      'libzmq5': {
                        'version': '4.1.3'
                      },
                      'nodejs': {
                        'version': '4.3.2'
                      },
                      'ecloud-runtime-agent': {
                        'version': '1.0.0'
                      }
                    },
                    'os_release': 'Trusty Tahr',
                    'os_version': '14.04',
                    'os_name': 'Ubuntu',
                    'description': 'ECloud Ubuntu 14.04 Privileged'
                  },
                  'agent': 'eslap://eslap.cloud/runtime-agent/1_0_0',
                  'entrypoint': '/eslap/runtime-agent/scripts/start-runtime-agent.sh',
                  'sourcedir': '/eslap/component',
                  'derived': {
                    'from': 'eslap://eslap.cloud/runtime/native/1_0_1'
                  },
                  'name': 'eslap://eslap.cloud/runtime/native/dev/privileged/1_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'spec': 'http://eslap.cloud/manifest/deployment/1_0_0',
              'servicename': 'eslap://eslap.cloud/services/admission/1_0_0',
              'interconnection': true,
              'configuration': {
                'parameters': {
                  'admission': {
                    'config': {
                      'domains': {
                        'random': {
                          'sufixNumbers': 4,
                          'words': 2,
                          'join': '-',
                          'prefix': ''
                        },
                        'refDomain': 'slap53.iti.es'
                      },
                      'server': {
                        'port': 8080
                      },
                      'planner': {
                        'plannerDomain': 'stamp-ticket740.slap53.iti.es',
                        'mockPlanner': false,
                        'addresses': [
                          '10.1.0.37'
                        ]
                      },
                      'manifestRepository': {
                        'config': {
                          'localImageStore': {
                            'imageFilename': 'manifest.json',
                            'path': '/slap/storage/local'
                          },
                          'remoteImageStore': {
                            'imageFilename': 'manifest.json',
                            'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                          }
                        },
                        'type': 'rsync'
                      },
                      'imageFetcher': {
                        'config': {
                          'localImageStore': {
                            'imageFilename': 'image.tgz',
                            'path': '/slap/storage/local'
                          },
                          'remoteImageStore': {
                            'imageFilename': 'image.tgz',
                            'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                          }
                        },
                        'type': 'blob'
                      },
                      'acs': {
                        'anonymous-user': {
                          'roles': [
                            'ADMIN'
                          ],
                          'id': 'admin-eslap@iti.es'
                        }
                      }
                    }
                  }
                },
                'resources': {}
              },
              'roles': {
                'admission': {
                  'resources': {
                    '__resilience': 1,
                    '__bandwidth': 1,
                    '__iopsintensive': true,
                    '__ioperf': 2,
                    '__memory': 2,
                    '__cpu': 1,
                    '__instances': 1
                  }
                }
              },
              'name': 'slap://eslap.cloud/deployments/20170503_070445/2cc42dc8',
              'service': {
                'connectors': [
                  {
                    'provided': [
                      {
                        'endpoint': 'sepdest',
                        'role': 'admission'
                      }
                    ],
                    'depended': [
                      {
                        'endpoint': 'http-admission'
                      }
                    ],
                    'type': 'eslap://eslap.cloud/connector/loadbalancer/1_0_0'
                  },
                  {
                    'depended': [
                      {
                        'endpoint': 'acs',
                        'role': 'admission'
                      }
                    ],
                    'provided': [
                      {
                        'endpoint': 'service-acs'
                      }
                    ],
                    'type': 'eslap://eslap.cloud/connector/loadbalancer/1_0_0'
                  },
                  {
                    'depended': [
                      {
                        'endpoint': 'planner',
                        'role': 'admission'
                      }
                    ],
                    'provided': [
                      {
                        'endpoint': 'service-planner'
                      }
                    ],
                    'type': 'eslap://eslap.cloud/connector/loadbalancer/1_0_0'
                  }
                ],
                'channels': {
                  'provides': [
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/channel/reply/1_0_0',
                      'name': 'http-admission'
                    }
                  ],
                  'requires': [
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/channel/request/1_0_0',
                      'name': 'service-acs'
                    },
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/channel/request/1_0_0',
                      'name': 'service-planner'
                    }
                  ]
                },
                'roles': [
                  {
                    'parameters': {},
                    'resources': {},
                    'component': 'eslap://eslap.cloud/components/admission/1_0_0',
                    'name': 'admission'
                  }
                ],
                'configuration': {
                  'parameters': [
                    {
                      'type': 'eslap://eslap.cloud/parameter/json/1_0_0',
                      'name': 'admission'
                    }
                  ],
                  'resources': []
                },
                'name': 'eslap://eslap.cloud/services/admission/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'components': {
                'eslap://eslap.cloud/components/admission/1_0_0': {
                  'codelocator': 'eslap://eslap.cloud/components/admission/1_0_0/image.tgz',
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0',
                  'name': 'eslap://eslap.cloud/components/admission/1_0_0',
                  'runtime': 'eslap://eslap.cloud/runtime/native/dev/privileged/1_0_1',
                  'code': '486cb4155c7fd02b3552b2cc6089cc7585d8ce9a',
                  'channels': {
                    'provides': [
                      {
                        'name': 'sepdest',
                        'type': 'eslap://eslap.cloud/channel/reply/1_0_0',
                        'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0'
                      }
                    ],
                    'requires': [
                      {
                        'name': 'acs',
                        'type': 'eslap://eslap.cloud/channel/request/1_0_0',
                        'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0'
                      },
                      {
                        'name': 'planner',
                        'type': 'eslap://eslap.cloud/channel/request/1_0_0',
                        'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0'
                      }
                    ]
                  },
                  'configuration': {
                    'resources': [],
                    'parameters': [
                      {
                        'name': 'config',
                        'type': 'eslap://eslap.cloud/parameter/json/1_0_0'
                      }
                    ]
                  },
                  'profile': {
                    'threadability': '*'
                  }
                }
              }
            }
          },
          'SLA': 'TBD',
          'arrangement': {
            'admission': {
              'failurezones': 1,
              'bandwidth': 1,
              'memory': 2,
              'cpu': 1,
              'maxinstances': 1,
              '__instances': 1,
              '__cpu': 1,
              '__memory': 2,
              '__ioperf': 2,
              '__iopsintensive': true,
              '__bandwidth': 1,
              '__resilience': 1,
              'mininstances': 1
            }
          },
          'runtimes': {
            'eslap://eslap.cloud/runtime/native/dev/privileged/1_0_1': {
              'metadata': {
                'software': {
                  'libsodium': {
                    'version': '1.0.5'
                  },
                  'libzmq5': {
                    'version': '4.1.3'
                  },
                  'nodejs': {
                    'version': '4.3.2'
                  },
                  'ecloud-runtime-agent': {
                    'version': '1.0.0'
                  }
                },
                'os_release': 'Trusty Tahr',
                'os_version': '14.04',
                'os_name': 'Ubuntu',
                'description': 'ECloud Ubuntu 14.04 Privileged'
              },
              'agent': 'eslap://eslap.cloud/runtime-agent/1_0_0',
              'entrypoint': '/eslap/runtime-agent/scripts/start-runtime-agent.sh',
              'sourcedir': '/eslap/component',
              'derived': {
                'from': 'eslap://eslap.cloud/runtime/native/1_0_1'
              },
              'name': 'eslap://eslap.cloud/runtime/native/dev/privileged/1_0_1',
              'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
            }
          },
          'resources': {},
          'spec': 'slap://slapdomain/manifests/deployment/0_0_1',
          'servicename': 'eslap://eslap.cloud/services/admission/1_0_0',
          'name': 'slap://eslap.cloud/deployments/20170503_070445/2cc42dc8',
          'interconnection': true,
          'entrypoints': {},
          'components-configuration': {
            'admission': {
              'config': {
                'domains': {
                  'random': {
                    'sufixNumbers': 4,
                    'words': 2,
                    'join': '-',
                    'prefix': ''
                  },
                  'refDomain': 'slap53.iti.es'
                },
                'server': {
                  'port': 8080
                },
                'planner': {
                  'plannerDomain': 'stamp-ticket740.slap53.iti.es',
                  'mockPlanner': false,
                  'addresses': [
                    '10.1.0.37'
                  ]
                },
                'manifestRepository': {
                  'config': {
                    'localImageStore': {
                      'imageFilename': 'manifest.json',
                      'path': '/slap/storage/local'
                    },
                    'remoteImageStore': {
                      'imageFilename': 'manifest.json',
                      'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                    }
                  },
                  'type': 'rsync'
                },
                'imageFetcher': {
                  'config': {
                    'localImageStore': {
                      'imageFilename': 'image.tgz',
                      'path': '/slap/storage/local'
                    },
                    'remoteImageStore': {
                      'imageFilename': 'image.tgz',
                      'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                    }
                  },
                  'type': 'blob'
                },
                'acs': {
                  'anonymous-user': {
                    'roles': [
                      'ADMIN'
                    ],
                    'id': 'admin-eslap@iti.es'
                  }
                }
              }
            },
            '__service': {
              'admission': {
                'config': {
                  'domains': {
                    'random': {
                      'sufixNumbers': 4,
                      'words': 2,
                      'join': '-',
                      'prefix': ''
                    },
                    'refDomain': 'slap53.iti.es'
                  },
                  'server': {
                    'port': 8080
                  },
                  'planner': {
                    'plannerDomain': 'stamp-ticket740.slap53.iti.es',
                    'mockPlanner': false,
                    'addresses': [
                      '10.1.0.37'
                    ]
                  },
                  'manifestRepository': {
                    'config': {
                      'localImageStore': {
                        'imageFilename': 'manifest.json',
                        'path': '/slap/storage/local'
                      },
                      'remoteImageStore': {
                        'imageFilename': 'manifest.json',
                        'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                      }
                    },
                    'type': 'rsync'
                  },
                  'imageFetcher': {
                    'config': {
                      'localImageStore': {
                        'imageFilename': 'image.tgz',
                        'path': '/slap/storage/local'
                      },
                      'remoteImageStore': {
                        'imageFilename': 'image.tgz',
                        'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                      }
                    },
                    'type': 'blob'
                  },
                  'acs': {
                    'anonymous-user': {
                      'roles': [
                        'ADMIN'
                      ],
                      'id': 'admin-eslap@iti.es'
                    }
                  }
                }
              }
            }
          },
          'components-resources': {
            'admission': {},
            '__service': {}
          },
          'configuration': {
            'admission': {
              'config': {
                'domains': {
                  'random': {
                    'sufixNumbers': 4,
                    'words': 2,
                    'join': '-',
                    'prefix': ''
                  },
                  'refDomain': 'slap53.iti.es'
                },
                'server': {
                  'port': 8080
                },
                'planner': {
                  'plannerDomain': 'stamp-ticket740.slap53.iti.es',
                  'mockPlanner': false,
                  'addresses': [
                    '10.1.0.37'
                  ]
                },
                'manifestRepository': {
                  'config': {
                    'localImageStore': {
                      'imageFilename': 'manifest.json',
                      'path': '/slap/storage/local'
                    },
                    'remoteImageStore': {
                      'imageFilename': 'manifest.json',
                      'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                    }
                  },
                  'type': 'rsync'
                },
                'imageFetcher': {
                  'config': {
                    'localImageStore': {
                      'imageFilename': 'image.tgz',
                      'path': '/slap/storage/local'
                    },
                    'remoteImageStore': {
                      'imageFilename': 'image.tgz',
                      'path': 'ubuntu@10.1.1.37:/home/ubuntu/slap/storage/remote'
                    }
                  },
                  'type': 'blob'
                },
                'acs': {
                  'anonymous-user': {
                    'roles': [
                      'ADMIN'
                    ],
                    'id': 'admin-eslap@iti.es'
                  }
                }
              }
            }
          }
        },
        'instanceList': {
          'eslap.cloud_admission_1': {
            'incnum': 1,
            'component': 'admission',
            'cnsocket': 'tcp://10.1.0.35:5310',
            'cnid': '84bea579-65d3-4752-82f9-67217c6d1666',
            'connected': true
          }
        },
        'involvedCNs': [
          {
            'initialResources': {
              'disk': 10,
              'bandwidth': 1000,
              'memory': 12,
              'cpu': 8
            },
            'size': 'm1.medium',
            'id': '84bea579-65d3-4752-82f9-67217c6d1666',
            'publicIp': '172.24.4.18',
            'privateIp': '10.1.0.35',
            'subnet': 'cb327f96-db68-4848-8a7e-1c565e263686',
            'net': '10dd0acf-137f-4024-8d40-1e9d433f4630',
            'zone': 'zone-0',
            'imageId': '9e3c665e-16c5-4825-afe4-d89867eaed19',
            'tags': {
              'slap': 'ticket740',
              'name': 'ticket740.cn'
            }
          }
        ]
      },
      'slap://eslap.cloud/deployments/20170503_070438/eb91d612': {
        'manifest': {
          'instance-configuration': {
            'eslap.cloud_acs_0': {
              'resources': {
                'data': {
                  'parameters': {
                    'server': '10.1.1.41',
                    'id': 'acs-volumes-000000001'
                  },
                  'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
                }
              }
            }
          },
          'configuration': {
            'acs': {
              'config': {}
            }
          },
          'components-resources': {
            'acs': {
              'data': {
                'parameters': {
                  'size': '10',
                  'prefix': 'acs-volumes'
                },
                'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
              }
            },
            '__service': {
              'data': {
                'resource': {
                  'parameters': {
                    'prefix': 'acs-volumes',
                    'size': '10'
                  },
                  'name': 'eslap://eslap.cloud/resources/volume/acs/persistent',
                  'spec': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
                },
                'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
              }
            }
          },
          'components-configuration': {
            'acs': {
              'config': {}
            },
            '__service': {
              'acs': {
                'config': {}
              }
            }
          },
          'entrypoints': {},
          'interconnection': true,
          'name': 'slap://eslap.cloud/deployments/20170503_070438/eb91d612',
          'servicename': 'eslap://eslap.cloud/services/acs/1_0_0',
          'spec': 'slap://slapdomain/manifests/deployment/0_0_1',
          'resources': {
            'data': {
              'resource': {
                'parameters': {
                  'prefix': 'acs-volumes',
                  'size': '10'
                },
                'name': 'eslap://eslap.cloud/resources/volume/acs/persistent',
                'spec': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
              },
              'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
            }
          },
          'runtimes': {
            'eslap://eslap.cloud/runtime/native/1_0_1': {
              'metadata': {
                'layerId': 'e6b2ce236ca21cb3e52bb23403203f5289474d8e0e75101cf62f114850353d7d',
                'software': {
                  'libsodium': {
                    'version': '1.0.5'
                  },
                  'libzmq5': {
                    'version': '4.1.3'
                  },
                  'nodejs': {
                    'version': '4.3.2'
                  },
                  'ecloud-runtime-agent': {
                    'version': '1.0.0'
                  }
                },
                'os_release': 'Trusty Tahr',
                'os_version': '14.04',
                'os_name': 'Ubuntu',
                'description': 'ECloud Ubuntu 14.04'
              },
              'entrypoint': '/eslap/runtime-agent/scripts/start-runtime-agent.sh',
              'sourcedir': '/eslap/component',
              'agent': 'eslap://eslap.cloud/runtime-agent/1_0_0',
              'name': 'eslap://eslap.cloud/runtime/native/1_0_1',
              'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
            }
          },
          'arrangement': {
            'acs': {
              'failurezones': 1,
              'bandwidth': 1,
              'memory': 1,
              'cpu': 1,
              'maxinstances': 1,
              '__instances': 1,
              '__cpu': 1,
              '__memory': 1,
              '__ioperf': 1,
              '__iopsintensive': false,
              '__bandwidth': 1,
              '__resilience': 1,
              'mininstances': 1
            }
          },
          'SLA': 'TBD',
          'versions': {
            'http://eslap.cloud/manifest/deployment/1_0_0': {
              'owner': 'admin-eslap@iti.es',
              'components-resources': {
                'acs': {
                  'data': {
                    'parameters': {
                      'size': '10',
                      'prefix': 'acs-volumes'
                    },
                    'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
                  }
                },
                '__service': {
                  'data': {
                    'resource': {
                      'parameters': {
                        'prefix': 'acs-volumes',
                        'size': '10'
                      },
                      'name': 'eslap://eslap.cloud/resources/volume/acs/persistent',
                      'spec': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
                    },
                    'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
                  }
                }
              },
              'components-configuration': {
                'acs': {
                  'config': {}
                },
                '__service': {
                  'acs': {
                    'config': {}
                  }
                }
              },
              'resources': {
                'data': {
                  'resource': {
                    'parameters': {
                      'prefix': 'acs-volumes',
                      'size': '10'
                    },
                    'name': 'eslap://eslap.cloud/resources/volume/acs/persistent',
                    'spec': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
                  },
                  'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
                }
              },
              'runtimes': {
                'eslap://eslap.cloud/runtime/native/1_0_1': {
                  'metadata': {
                    'layerId': 'e6b2ce236ca21cb3e52bb23403203f5289474d8e0e75101cf62f114850353d7d',
                    'software': {
                      'libsodium': {
                        'version': '1.0.5'
                      },
                      'libzmq5': {
                        'version': '4.1.3'
                      },
                      'nodejs': {
                        'version': '4.3.2'
                      },
                      'ecloud-runtime-agent': {
                        'version': '1.0.0'
                      }
                    },
                    'os_release': 'Trusty Tahr',
                    'os_version': '14.04',
                    'os_name': 'Ubuntu',
                    'description': 'ECloud Ubuntu 14.04'
                  },
                  'entrypoint': '/eslap/runtime-agent/scripts/start-runtime-agent.sh',
                  'sourcedir': '/eslap/component',
                  'agent': 'eslap://eslap.cloud/runtime-agent/1_0_0',
                  'name': 'eslap://eslap.cloud/runtime/native/1_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'spec': 'http://eslap.cloud/manifest/deployment/1_0_0',
              'servicename': 'eslap://eslap.cloud/services/acs/1_0_0',
              'interconnection': true,
              'configuration': {
                'parameters': {
                  'acs': {
                    'config': {}
                  }
                },
                'resources': {
                  'data': 'eslap://eslap.cloud/resources/volume/acs/persistent'
                }
              },
              'roles': {
                'acs': {
                  'resources': {
                    '__resilience': 1,
                    '__bandwidth': 1,
                    '__iopsintensive': false,
                    '__ioperf': 1,
                    '__memory': 1,
                    '__cpu': 1,
                    '__instances': 1
                  }
                }
              },
              'name': 'slap://eslap.cloud/deployments/20170503_070438/eb91d612',
              'service': {
                'connectors': [
                  {
                    'provided': [
                      {
                        'endpoint': 'sepdest',
                        'role': 'acs'
                      }
                    ],
                    'depended': [
                      {
                        'endpoint': 'http-acs'
                      },
                      {
                        'endpoint': 'admission-acs'
                      }
                    ],
                    'type': 'eslap://eslap.cloud/connector/loadbalancer/1_0_0'
                  }
                ],
                'channels': {
                  'provides': [
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/channel/reply/1_0_0',
                      'name': 'http-acs'
                    },
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/channel/reply/1_0_0',
                      'name': 'admission-acs'
                    }
                  ],
                  'requires': []
                },
                'roles': [
                  {
                    'parameters': {},
                    'resources': {
                      'data': 'data'
                    },
                    'component': 'eslap://eslap.cloud/components/acs/1_0_0',
                    'name': 'acs'
                  }
                ],
                'configuration': {
                  'parameters': [
                    {
                      'type': 'eslap://eslap.cloud/parameter/json/1_0_0',
                      'name': 'acs'
                    }
                  ],
                  'resources': [
                    {
                      'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0',
                      'name': 'data'
                    }
                  ]
                },
                'name': 'eslap://eslap.cloud/services/acs/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'components': {
                'eslap://eslap.cloud/components/acs/1_0_0': {
                  'codelocator': 'eslap://eslap.cloud/components/acs/1_0_0/image.tgz',
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0',
                  'name': 'eslap://eslap.cloud/components/acs/1_0_0',
                  'runtime': 'eslap://eslap.cloud/runtime/native/1_0_1',
                  'channels': {
                    'provides': [
                      {
                        'name': 'sepdest',
                        'type': 'eslap://eslap.cloud/channel/reply/1_0_0',
                        'protocol': 'TBD'
                      }
                    ],
                    'requires': []
                  },
                  'configuration': {
                    'resources': [
                      {
                        'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0',
                        'name': 'data'
                      }
                    ],
                    'parameters': [
                      {
                        'name': 'config',
                        'type': 'eslap://eslap.cloud/parameter/json/1_0_0'
                      }
                    ]
                  },
                  'profile': {
                    'threadability': '*'
                  },
                  'code': '2aec4dd4e62b08ae3731eca18f81b2c166365789'
                }
              }
            },
            'slap://slapdomain/manifests/deployment/0_0_1': {
              'owner': 'admin-eslap@iti.es',
              'components': {
                'eslap://eslap.cloud/components/acs/1_0_0': {
                  'required': {},
                  'provided': {
                    'sepdest': {
                      'protocol': 'TBD',
                      'channel_type': 'slap://slapdomain/endpoints/reply'
                    }
                  },
                  'profile': {
                    'threadability': '*'
                  },
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0',
                  'name': 'eslap://eslap.cloud/components/acs/1_0_0',
                  'runtime': 'eslap://eslap.cloud/runtime/native/1_0_1',
                  'code': '2aec4dd4e62b08ae3731eca18f81b2c166365789',
                  'codelocator': 'eslap://eslap.cloud/components/acs/1_0_0/image.tgz',
                  'configuration': {
                    'config': 'string'
                  },
                  'resources': [
                    {
                      'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0',
                      'name': 'data'
                    }
                  ],
                  'external': 'TBD'
                }
              },
              'service': {
                'configuration_spread': {},
                'defaults': {},
                'configuration': {},
                'connectors': [
                  {
                    'providers': [
                      {
                        'channel': 'sepdest',
                        'component': 'acs'
                      }
                    ],
                    'dependents': [
                      {
                        'channel': 'sepsource'
                      },
                      {
                        'channel': 'sepsource'
                      }
                    ],
                    'type': 'slap://slapdomain/connectors/lb'
                  }
                ],
                'components': {
                  'acs': 'eslap://eslap.cloud/components/acs/1_0_0'
                },
                'name': 'eslap://eslap.cloud/services/acs/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'SLA': 'TBD',
              'arrangement': {
                'acs': {
                  'failurezones': 1,
                  'bandwidth': 1,
                  'memory': 1,
                  'cpu': 1,
                  'maxinstances': 1,
                  '__instances': 1,
                  '__cpu': 1,
                  '__memory': 1,
                  '__ioperf': 1,
                  '__iopsintensive': false,
                  '__bandwidth': 1,
                  '__resilience': 1,
                  'mininstances': 1
                }
              },
              'runtimes': {
                'eslap://eslap.cloud/runtime/native/1_0_1': {
                  'metadata': {
                    'layerId': 'e6b2ce236ca21cb3e52bb23403203f5289474d8e0e75101cf62f114850353d7d',
                    'software': {
                      'libsodium': {
                        'version': '1.0.5'
                      },
                      'libzmq5': {
                        'version': '4.1.3'
                      },
                      'nodejs': {
                        'version': '4.3.2'
                      },
                      'ecloud-runtime-agent': {
                        'version': '1.0.0'
                      }
                    },
                    'os_release': 'Trusty Tahr',
                    'os_version': '14.04',
                    'os_name': 'Ubuntu',
                    'description': 'ECloud Ubuntu 14.04'
                  },
                  'entrypoint': '/eslap/runtime-agent/scripts/start-runtime-agent.sh',
                  'sourcedir': '/eslap/component',
                  'agent': 'eslap://eslap.cloud/runtime-agent/1_0_0',
                  'name': 'eslap://eslap.cloud/runtime/native/1_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'resources': {
                'data': {
                  'resource': {
                    'parameters': {
                      'prefix': 'acs-volumes',
                      'size': '10'
                    },
                    'name': 'eslap://eslap.cloud/resources/volume/acs/persistent',
                    'spec': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
                  },
                  'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
                }
              },
              'spec': 'slap://slapdomain/manifests/deployment/0_0_1',
              'servicename': 'eslap://eslap.cloud/services/acs/1_0_0',
              'name': 'slap://eslap.cloud/deployments/20170503_070438/eb91d612',
              'interconnection': true,
              'entrypoints': {},
              'components-configuration': {
                'acs': {
                  'config': {}
                },
                '__service': {
                  'acs': {
                    'config': {}
                  }
                }
              },
              'components-resources': {
                'acs': {
                  'data': {
                    'parameters': {
                      'size': '10',
                      'prefix': 'acs-volumes'
                    },
                    'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
                  }
                },
                '__service': {
                  'data': {
                    'resource': {
                      'parameters': {
                        'prefix': 'acs-volumes',
                        'size': '10'
                      },
                      'name': 'eslap://eslap.cloud/resources/volume/acs/persistent',
                      'spec': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
                    },
                    'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
                  }
                }
              },
              'configuration': {
                'acs': {
                  'config': {}
                }
              }
            },
            'http://eslap.cloud/manifest/deployment/1_0_0_CLASSIC': {
              'owner': 'admin-eslap@iti.es',
              'components-resources': {
                'acs': {
                  'data': {
                    'parameters': {
                      'size': '10',
                      'prefix': 'acs-volumes'
                    },
                    'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
                  }
                },
                '__service': {
                  'data': {
                    'resource': {
                      'parameters': {
                        'prefix': 'acs-volumes',
                        'size': '10'
                      },
                      'name': 'eslap://eslap.cloud/resources/volume/acs/persistent',
                      'spec': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
                    },
                    'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
                  }
                }
              },
              'components-configuration': {
                'acs': {
                  'config': {}
                },
                '__service': {
                  'acs': {
                    'config': {}
                  }
                }
              },
              'resources': {
                'data': {
                  'resource': {
                    'parameters': {
                      'prefix': 'acs-volumes',
                      'size': '10'
                    },
                    'name': 'eslap://eslap.cloud/resources/volume/acs/persistent',
                    'spec': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
                  },
                  'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0'
                }
              },
              'runtimes': {
                'eslap://eslap.cloud/runtime/native/1_0_1': {
                  'metadata': {
                    'layerId': 'e6b2ce236ca21cb3e52bb23403203f5289474d8e0e75101cf62f114850353d7d',
                    'software': {
                      'libsodium': {
                        'version': '1.0.5'
                      },
                      'libzmq5': {
                        'version': '4.1.3'
                      },
                      'nodejs': {
                        'version': '4.3.2'
                      },
                      'ecloud-runtime-agent': {
                        'version': '1.0.0'
                      }
                    },
                    'os_release': 'Trusty Tahr',
                    'os_version': '14.04',
                    'os_name': 'Ubuntu',
                    'description': 'ECloud Ubuntu 14.04'
                  },
                  'entrypoint': '/eslap/runtime-agent/scripts/start-runtime-agent.sh',
                  'sourcedir': '/eslap/component',
                  'agent': 'eslap://eslap.cloud/runtime-agent/1_0_0',
                  'name': 'eslap://eslap.cloud/runtime/native/1_0_1',
                  'spec': 'http://eslap.cloud/manifest/runtime/1_0_0'
                }
              },
              'spec': 'http://eslap.cloud/manifest/deployment/1_0_0',
              'servicename': 'eslap://eslap.cloud/services/acs/1_0_0',
              'interconnection': true,
              'configuration': {
                'parameters': {
                  'acs': {
                    'config': {}
                  }
                },
                'resources': {
                  'data': 'eslap://eslap.cloud/resources/volume/acs/persistent'
                }
              },
              'roles': {
                'acs': {
                  'resources': {
                    '__resilience': 1,
                    '__bandwidth': 1,
                    '__iopsintensive': false,
                    '__ioperf': 1,
                    '__memory': 1,
                    '__cpu': 1,
                    '__instances': 1
                  }
                }
              },
              'name': 'slap://eslap.cloud/deployments/20170503_070438/eb91d612',
              'service': {
                'connectors': [
                  {
                    'provided': [
                      {
                        'endpoint': 'sepdest',
                        'role': 'acs'
                      }
                    ],
                    'depended': [
                      {
                        'endpoint': 'http-acs'
                      },
                      {
                        'endpoint': 'admission-acs'
                      }
                    ],
                    'type': 'eslap://eslap.cloud/connector/loadbalancer/1_0_0'
                  }
                ],
                'channels': {
                  'provides': [
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/channel/reply/1_0_0',
                      'name': 'http-acs'
                    },
                    {
                      'protocol': 'eslap://eslap.cloud/protocol/message/http/1_0_0',
                      'type': 'eslap://eslap.cloud/channel/reply/1_0_0',
                      'name': 'admission-acs'
                    }
                  ],
                  'requires': []
                },
                'roles': [
                  {
                    'parameters': {},
                    'resources': {
                      'data': 'data'
                    },
                    'component': 'eslap://eslap.cloud/components/acs/1_0_0',
                    'name': 'acs'
                  }
                ],
                'configuration': {
                  'parameters': [
                    {
                      'type': 'eslap://eslap.cloud/parameter/json/1_0_0',
                      'name': 'acs'
                    }
                  ],
                  'resources': [
                    {
                      'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0',
                      'name': 'data'
                    }
                  ]
                },
                'name': 'eslap://eslap.cloud/services/acs/1_0_0',
                'spec': 'http://eslap.cloud/manifest/service/1_0_0'
              },
              'components': {
                'eslap://eslap.cloud/components/acs/1_0_0': {
                  'codelocator': 'eslap://eslap.cloud/components/acs/1_0_0/image.tgz',
                  'spec': 'http://eslap.cloud/manifest/component/1_0_0',
                  'name': 'eslap://eslap.cloud/components/acs/1_0_0',
                  'runtime': 'eslap://eslap.cloud/runtime/native/1_0_1',
                  'channels': {
                    'provides': [
                      {
                        'name': 'sepdest',
                        'type': 'eslap://eslap.cloud/channel/reply/1_0_0',
                        'protocol': 'TBD'
                      }
                    ],
                    'requires': []
                  },
                  'configuration': {
                    'resources': [
                      {
                        'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0',
                        'name': 'data'
                      }
                    ],
                    'parameters': [
                      {
                        'name': 'config',
                        'type': 'eslap://eslap.cloud/parameter/json/1_0_0'
                      }
                    ]
                  },
                  'profile': {
                    'threadability': '*'
                  },
                  'code': '2aec4dd4e62b08ae3731eca18f81b2c166365789'
                }
              }
            }
          },
          'service': {
            'configuration_spread': {},
            'defaults': {},
            'configuration': {},
            'connectors': [
              {
                'providers': [
                  {
                    'channel': 'sepdest',
                    'component': 'acs'
                  }
                ],
                'dependents': [
                  {
                    'channel': 'sepsource'
                  },
                  {
                    'channel': 'sepsource'
                  }
                ],
                'type': 'slap://slapdomain/connectors/lb'
              }
            ],
            'components': {
              'acs': 'eslap://eslap.cloud/components/acs/1_0_0'
            },
            'name': 'eslap://eslap.cloud/services/acs/1_0_0',
            'spec': 'http://eslap.cloud/manifest/service/1_0_0'
          },
          'components': {
            'eslap://eslap.cloud/components/acs/1_0_0': {
              'required': {},
              'provided': {
                'sepdest': {
                  'protocol': 'TBD',
                  'channel_type': 'slap://slapdomain/endpoints/reply'
                }
              },
              'profile': {
                'threadability': '*'
              },
              'spec': 'http://eslap.cloud/manifest/component/1_0_0',
              'name': 'eslap://eslap.cloud/components/acs/1_0_0',
              'runtime': 'eslap://eslap.cloud/runtime/native/1_0_1',
              'code': '2aec4dd4e62b08ae3731eca18f81b2c166365789',
              'codelocator': 'eslap://eslap.cloud/components/acs/1_0_0/image.tgz',
              'configuration': {
                'config': 'string'
              },
              'resources': [
                {
                  'type': 'eslap://eslap.cloud/resource/volume/persistent/1_0_0',
                  'name': 'data'
                }
              ],
              'external': 'TBD'
            }
          },
          'owner': 'admin-eslap@iti.es'
        },
        'instanceList': {
          'eslap.cloud_acs_0': {
            'incnum': 1,
            'component': 'acs',
            'cnsocket': 'tcp://10.1.0.35:5310',
            'cnid': '84bea579-65d3-4752-82f9-67217c6d1666',
            'connected': true
          }
        },
        'involvedCNs': [
          {
            'initialResources': {
              'disk': 10,
              'bandwidth': 1000,
              'memory': 12,
              'cpu': 8
            },
            'size': 'm1.medium',
            'id': '84bea579-65d3-4752-82f9-67217c6d1666',
            'publicIp': '172.24.4.18',
            'privateIp': '10.1.0.35',
            'subnet': 'cb327f96-db68-4848-8a7e-1c565e263686',
            'net': '10dd0acf-137f-4024-8d40-1e9d433f4630',
            'zone': 'zone-0',
            'imageId': '9e3c665e-16c5-4825-afe4-d89867eaed19',
            'tags': {
              'slap': 'ticket740',
              'name': 'ticket740.cn'
            }
          }
        ]
      }
    },
    'deployedInstances': {
      'eslap.cloud_monitor_5': {
        'cnId': '84bea579-65d3-4752-82f9-67217c6d1666'
      },
      'eslap.cloud_sep_4': {
        'cnId': '84bea579-65d3-4752-82f9-67217c6d1666'
      },
      'eslap.cloud_sep_3': {
        'cnId': '84bea579-65d3-4752-82f9-67217c6d1666'
      },
      'eslap.cloud_sep_2': {
        'cnId': '84bea579-65d3-4752-82f9-67217c6d1666'
      },
      'eslap.cloud_admission_1': {
        'cnId': '84bea579-65d3-4752-82f9-67217c6d1666'
      },
      'eslap.cloud_acs_0': {
        'cnId': '84bea579-65d3-4752-82f9-67217c6d1666'
      }
    },
    'allocatedNodes': {
      '84bea579-65d3-4752-82f9-67217c6d1666': {
        'initialResources': {
          'disk': 10,
          'bandwidth': 1000,
          'memory': 12,
          'cpu': 8
        },
        'size': 'm1.medium',
        'id': '84bea579-65d3-4752-82f9-67217c6d1666',
        'publicIp': '172.24.4.18',
        'privateIp': '10.1.0.35',
        'subnet': 'cb327f96-db68-4848-8a7e-1c565e263686',
        'net': '10dd0acf-137f-4024-8d40-1e9d433f4630',
        'zone': 'zone-0',
        'imageId': '9e3c665e-16c5-4825-afe4-d89867eaed19',
        'tags': {
          'slap': 'ticket740',
          'name': 'ticket740.cn'
        }
      }
    },
    'linkedServices': [
      {
        'deployment1': 'slap://eslap.cloud/deployments/20170503_070445/2cc42dc8',
        'channel1': 'service-acs',
        'deployment2': 'slap://eslap.cloud/deployments/20170503_070438/eb91d612',
        'channel2': 'http-acs'
      },
      {
        'deployment1': 'slap://eslap.cloud/deployments/20170503_070449/0ad2957b',
        'channel1': 'frontend',
        'deployment2': 'slap://eslap.cloud/deployments/20170503_070438/eb91d612',
        'channel2': 'http-acs'
      },
      {
        'deployment1': 'slap://eslap.cloud/deployments/20170503_070454/f2ab3137',
        'channel1': 'frontend',
        'deployment2': 'slap://eslap.cloud/deployments/20170503_070445/2cc42dc8',
        'channel2': 'http-admission'
      },
      {
        'deployment1': 'slap://eslap.cloud/deployments/20170503_070459/9df375a4',
        'channel1': 'frontend',
        'deployment2': 'slap://eslap.cloud/deployments/20170503_070503/c10c1661',
        'channel2': 'http-monitor'
      }
    ]
  }
};