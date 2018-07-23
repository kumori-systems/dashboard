# Dashboard

Dashboard single web page for Kumori Ecloud.

## Setup

``` bash
git clone git@gitlab.com:ECloud/dashboard.git;
cd dashboard;
npm install;
npm run dev;
```

The service will be running under localhost:8080

## Build

``` bash
npm run build;
```

All compiled service will be under dist/

## Developer tools

For web debugging we can se
[vue devtools](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd),
which will allow us to see the actual state of the store and the changes made to
it.

For visual studio it's recommended
[vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur), which
will give us a visual help in *.vue files.

## Brief introduction to vue

[Vue](https://vuejs.org/) has become famous because how easy is to use it's
complements from different libraries like vuetify, which is the actuall
material design component framework. In addition Vue can be used in web, in
[android](https://medium.com/@codingfriend/i-built-an-android-app-with-vue-2-and-it-was-easy-b681544e7f30)
and
[desktop applications](https://codeburst.io/native-desktop-applications-using-vue-js-964e841e3c1d),
and different projects are taking place like
[server-side rendering](https://vuejs.org/v2/guide/ssr.html) web pages and
[documentation rendering](https://vuepress.vuejs.org/guide/)
projects between others.

[Vuetify](https://vuetifyjs.com/releases/0.16/#/) as our component framework.
This means vuetify will provide us of different components which implement the
design specifications purposed by the google design specification
[material design](https://material.io/design/). There are other great component
frameworks like [bootstrap-vue](https://bootstrap-vue.js.org/) and more can be
seen at [vue-awesome](https://github.com/vuejs/awesome-vue) and at
[made with vue](https://madewithvuejs.com/frameworks)

Vue files are the core of vue and at least contain 2 blocks, the 'template'
block, which provides the html (or code which compiles to html) and the 'script'
block, which provides a place for the javascript (or code wich compiles to
javascript). Additionally any number of blocks for different things can be
added, mainly it's used another code for the style which contains css (or any
code which compiles to css).

### How compile different languages to html, javscript and css

Ok, so the problem is *.vue files have different languages written on the same
file, which is a headache for our compilers. This is where the 'vue-loader'
module comes in place. Vue can also be used for android in a similar way.

The vue-loader module is a module for webpack. It's job is to split the
different modules to bring the respective one to the correct compiler. After all
the code has been compiled it will be understood by our browser.

### Store

The store is beeing used as a cache for our service. If vue tries to get some
information and the information is not in the store, then a request is done to
the service.

1 - While the information is not in it's place you have to handle it

2 - When the information arrives, if you are making the commits well, the data
will be automatically updated.

* IMPORTANT Well commmiting; Vue relies on javascript to update the data from
  it's visual side, but it has got some limitations. The store can update
  changes when them have been done in a first-level propperty, like
  numInstances = 5;
  but changes won't be seen if numInstances is inside another propperty like
  instances { numInstances = 5 }.
  Different methods are given to try to avoid this: [spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax),
  [vue set](https://vuejs.org/v2/guide/reactivity.html)

### Recommendations

It's important to take a look at the different possibilities which vue gives us.

1 - [Vue components are structured in a tree](https://vuejs.org/v2/guide/index.html#Composing-with-Components).

2 - [Vue life cycle](https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram)

4 - [Import or export components](https://vuejs.org/v2/guide/components-registration.html#Module-Systems).

3 - [Try always to use computted propperties over watchers](https://vuejs.org/v2/guide/computed.html#Computed-Properties).

5 - [Data flow from parents to children](https://vuejs.org/v2/guide/components-props.html).

6 - [Data flow from children to parents](https://stackoverflow.com/questions/43334796/pass-data-from-child-to-parent-in-vuejs-is-it-so-complicated).

7 - [Data update; reactivity](https://vuejs.org/v2/guide/reactivity.html)

7 - Use the recommended tools (vetur, vue devtools), so they will provide warnings for the basic mistakes.

8 - If vue devtools is not shown (without a crash message), then you are making
STORE CHANGES in the WRONG PLACE!.

9 - [Typescript in vue](https://vuejs.org/v2/guide/typescript.html)

10 - Avoid the use of '_' in vue properties, thus '_' and '$' are reserved
symbols.

## This project structure

build - Generally it's about webpack configuration.

src - Source files.

static - Static folder provided with the compiled source files. Here go things
like images or static css or other compiled libraries.

test - Test folder. Actually there are not relevant tests.

index.html - This is the file where all vue will be mounted on.

package.json - Npm configuration for this project.

tsconfig - Typescript configuration for this project.

tslint - Typescript linter configuration.

vue.typescript.d.ts - This file is used in conjunction by typescript and the
vue-loader.

### Src

NOTE: Attention with special files!

* Vue: main.ts, App.vue, router/index.ts and store/*

* Vuetify: main.ts, App.vue, components/AppbarComponent.vue,
  components/NavigationComponent.vue

api - This is where it's made a binding with admission-client. All required
configuration with admisison-client will be here. The transformation functions
from the admission-client -> dashboard and dashboard -> admission-client classes
are here.

components - Reusable components which could be used in other pages. Usually
components here won't be firs-level components and a good practice is to not
allow them acces the store, which means all data is required by props and
communication with parents will be done by emitting events.
Components which are not inside a folder are first-level components and are a
bit special. Before editting them, take a look at the info
[AppbarComponent](https://vuetifyjs.com/releases/0.16/#/components/toolbars),
[NavigationComponent](https://vuetifyjs.com/releases/0.16/#/components/navigation-drawers).

router - As router is used [vue-router](https://router.vuejs.org/), which is an
oficially supported router for vue. This means it's abble to change between
different components depending on the path and providing the sense of changing
between different pages or views. This file is really simple to read and won't
be a trouble.

store - [Vuex](https://vuex.vuejs.org/) is the officially supported store for
vue. The store is implemented as a cache of the service and will maintain all
data received from petitions. Data is organized in modules and each module has
it's own data types and functions. The way each module is scheduled is:

  index - IMPORTANT strict propperty; this propperty watches for the right
  way of implementing changes on the store. This propperty should only be true
  when the dashboard is in development mode thus it makes the store to run
  slowlier but it's a good help for newcommers to vue thus forces good habits.
  The other code in this file is to point the different modules of the store.

  classes - All classes newly created by this module. For example, all general
  classes for a webpage will be under pagestate/classes, all classes related to
  the Kumori PAAS will be under stampstate/classes. The manifest editor does not
  include new needed classes, thus all has been implemented like common
  javascript objects and there are not classes definitions.

  state - The state of this module. This is where it's said which object is
  stored where and the innitial values of each one. IMPORTANT

  getters - Is the way some info should be taken from the store. Getters sould
  be kept SIMPLE! because when data changes all getters are recalculated. There
  is an important rule; hard computations should be kept BEFORE saving the data
  to a store or AFTER getting the data from the store, this means in the
  components. The reason is simple, an user won't understand why the page is
  running slowly if the view is simple but will understand a complex view to run
  a bit slowlier. This is why all getters in this file are really simple
  (because they are always executed) and all hard computation is done inside the
  respective component (were only is executed if the user is watching the
  component).

  mutations - Mutations are the way to make changes to the store and should be
  kept simple. Mutations are executed in an atomic way(no mutation can be
  interrumpted by other mutation), thus keep less mutations as possible the less
  complex as possible. But try to keep mutations grouped in user actions, for
  example if the user wants to remove a link, you have to remove it from
  different places and all that should be done in the same mutation, but if you
  want to add a link and remove another one, then that should be two different
  mutations.

  actions - Actions provide asynchony to mutations and is the recommended way of
  doing them. This is mutations are only allowed inside actions. For example if
  it's required to change the links of a deployment where a link is broken and
  two new links are created, then the action called 'update_links' will have a
  commit 'unlink' and two 'link' commits.

  NOTE: If an action/mutation/getter is called, you have to be carefull of giving
  different names to each one, thus all 'clear' actions of each module are called
  if you call this.$store.dispatch('clear');

stylus - A folder which contains the css theme in stylys language. This is not
actually working thus the actual vue version of this project has got a bug and
won't use the theme descripted in this file.

views - Product-concrete views. This means these vue components won't usually be
reusable in other pages. These components are first-level components and should
access to the store to get the data and provide it as props to their respective
children components.

App.vue - This is the main vue component which represents the entire application
and will give the structure of the application bar and the navigation drawer
between all components.

main.ts - This is the entrypoint of all the project. It will require all vue
libraries and assign vue to a label in the html code.
