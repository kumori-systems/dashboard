<template>
    <div>
    </div>
</template>

<script>
import Vue from 'vue'
import VueNotification from 'vue-bulma-notification';
Vue.use(VueNotification);
export default {
    components: {
        'vue-notification': VueNotification
    },
    props: {
        type: String,
        title: String,
        message: String,
        direction: {
            type: String,
            default: 'Right'
        },
        duration: {
            type: Number,
            default: 4500
        },
        container: {
            type: String,
            default: '.notifications'
        }
    },

    data() {
        return {
            $_parent_: null,
            show: true
        }
    },
/*
    created() {
        let $parent = this.$parent
        if (!$parent) {
            let parent = document.querySelector(this.container)
            if (!parent) {
                // Lazy creating `div.notifications` container.
                const className = this.container.replace('.', '')
                const Notifications = Vue.extend({
                    name: 'Notifications',
                    render(h) {
                        return h('div', {
                            'class': {
                                [`${className}`]: true
                            }
                        })
                    }
                })
                $parent = new Notifications().$mount()
                document.body.appendChild($parent.$el)
            } else {
                $parent = parent.__vue__
            }
            // Hacked.
            this.$_parent_ = $parent
        }
    },
*/
/*
    mounted() {
        if (this.$_parent_) {
            this.$_parent_.$el.appendChild(this.$el)
            this.$parent = this.$_parent_
            delete this.$_parent_
        }
        if (this.duration > 0) {
            this.timer = setTimeout(() => this.close(), this.duration)
        }
    },
*/
    destroyed() {
        this.$el.remove()
    },

    computed: {
        transition() {
            return `bounce-${this.direction}`
        },

        enterClass() {
            return `bounceIn${this.direction}`
        },

        leaveClass() {
            return `bounceOut${this.direction}`
        },
    },

    methods: {
        closedByUser() {
            this.$emit('closed-by-user')
            clearTimeout(this.timer)
            this.show = false
        },

        close() {
            this.$emit('closed-automatically')
            clearTimeout(this.timer)
            this.show = false
        },

        afterLeave() {
            this.$destroy()
        }
    }
}
</script>

<style lang="scss">
@import '~bulma/sass/utilities/variables';
@import '~bulma/sass/utilities/mixins';

.notifications {
    position: fixed;
    top: 50px;
    right: 0;
    z-index: 1024 + 233;
    pointer-events: none;

    @include tablet() {
        max-width: 320px;
    }

    .notification {
        margin: 20px;
    }
}

.notification {
    position: relative;
    min-width: 240px;
    backface-visibility: hidden;
    transform: translate3d(0, 0, 0);
    pointer-events: all;
}
</style>
