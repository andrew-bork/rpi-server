const e = React.createElement;

const socket = io();

class MainPage extends React.Component {

    constructor(params) {
        super(params);

        this.state = {
            selected_process: null,
            process_list: null,
            tab: 0,
            stdout: "",
        };

        fetch("/process/view", { method: "GET" }).then((res) => {
            res.json().then((data) => {
                this.setState({ process_list: data.processes });
            })
        });

        socket.on("process-list-update", (processes) => {
            this.setState({ process_list: processes });
        })

        socket.on("stdout-add", (data) => {
            this.setState({ stdout: this.state.stdout + data });
        });
    }

    render() {

        var rendered = e("div", {}, "bruh conk");
        if (this.state.tab === 1) {
            rendered = e(Console, { stdout: this.state.stdout });
        } else if (this.state.tab === 2) {
            rendered = e(NewProcessTab, {
                action: () => {
                    const name = document.getElementById("name").value;
                    const cmd = document.getElementById("cmd").value;

                    fetch(`/process/new?name=${encodeURIComponent(name)}&cmd=${encodeURIComponent(cmd)}`, { method: "GET" }).then(
                        (response) =>
                        response.json().then((data) => {
                            if (data.success) {
                                this.setState({ tab: 1, selected_process: data.name });
                                fetch(`/process/view?name=${encodeURIComponent(data.name)}`).then((response) => {
                                    response.json().then((data) => {
                                        this.setState({ stdout: data.stdout });
                                    })
                                });
                            }
                        })
                    )
                }
            });
        }

        return e("div", {
                id: "process-view",
                className: ""
            },
            e(SideBar, {
                header: "RPI Control",
                options: [{
                    name: "Processes",
                    flyout: true,
                    icon: icons.code,
                    options: (this.state.process_list ? this.state.process_list.map((process, i) => {
                        return {
                            name: process.name,
                            idle: process.idle,
                            current_command: process.current_command,
                            action: () => {
                                this.setState({ selected_process: process.name, tab: 1 });
                                fetch(`/process/view?name=${encodeURIComponent(process.name)}`).then((response) => {
                                    response.json().then((data) => {
                                        this.setState({ stdout: data.stdout });
                                    })
                                });
                            }
                        }
                    }) : [])
                }, {
                    name: "Settings",
                    icon: icons.settings,
                    flyout: false,
                    action: () => {
                        alert("Settings");
                    }
                }, {
                    name: "New Process",
                    icon: icons.add,
                    flyout: false,
                    action: () => {
                        this.setState({ tab: 2 });
                    }
                }, {
                    name: "Restart Server",
                    icon: icons.stop,
                    flyout: false,
                    action: () => {
                        fetch("/stop", { method: "GET" });
                    }
                }]
            }),
            rendered
        );
    }
}

class SideBar extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return e("div", { className: "side-bar active", width: "300px" },
            e("div", { className: "header" }, this.props.header),
            e(VerticalNavigation, { options: this.props.options })
        );
    }
}

class VerticalNavigation extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return e("ul", { className: "nav-bar" },
            this.props.options.map((option, i) => {
                if (option.flyout) {
                    return e(VerticalNavigationBarFlyoutOption, { key: i, option: option });
                }
                return e(VerticalNavigationBarOption, { key: i, option: option });
            }));
    }
}

class VerticalNavigationBarFlyoutOption extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        console.log(this.props.option);
        return e("li", { className: "flyout" },
            (this.props.option.icon ? e("span", { className: "icon" }, this.props.option.icon({})) : null),
            e("span", {}, this.props.option.name),
            e("ul", {},
                this.props.option.options.map((option, i) => e(VerticalNavigationBarOption, { key: i, option: option }))
            )
        );
    }
}
class VerticalNavigationBarOption extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        console.log(this.props.option);
        return e("li", { onClick: () => { this.props.option.action() } },
            (this.props.option.icon ? e("span", { className: "icon" }, this.props.option.icon({})) : null),
            e("span", {}, this.props.option.name)
        );
    }
}

class Console extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return e("div", { className: "stdout" },
            e("div", {},
                e("span", {}, "zsh / $"),
                e("input", {})
            ),
            this.props.stdout.split("\n").map((line, i) => {
                return e("div", { key: i }, line);
            })
        );
    }
}




class NewProcessTab extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        /**
         * <div class="fancy">
        <div class="header">New Process</div>
        <div class="fancy-input" style="width: 30em;">
            <input id="name" required autocomplete="off">
            <label for="name">Process Name</label>
        </div>
        <div class="fancy-input" style="width: 30em;">
            <input id="cmd" required autocomplete="off">
            <label for="cmd">Process Command</label>
        </div>
        <br>
        <button>Create<div></div></button>
    </div>
         */

        return e("div", { className: "fancy" },
            e("div", { className: "header" }, "New Process"),
            e("div", { className: "fancy-input", style: { width: "30em" } },
                e("input", { id: "name", autoComplete: "off", required: true }),
                e("label", { htmlFor: "name" }, "Process Name")
            ),
            e("div", { className: "fancy-input", style: { width: "30em" } },
                e("input", { id: "cmd", autoComplete: "off", required: true }),
                e("label", { htmlFor: "cmd" }, "Process Command")
            ),
            e("br"),
            e("button", { onClick: () => { this.props.action(); } }, "Create", e("div")));
    }
}
































const icons = {
    settings: (props = {}) => {
        props.xmlns = "http://www.w3.org/2000/svg";
        props.viewBox = "0 0 24 24";

        return e("svg", props,
            e("path", { d: "M0 0h24v24H0V0z", fill: "none" }),
            e("path", { d: "M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" }),
        );
    },
    code: (props = {}) => {
        props.xmlns = "http://www.w3.org/2000/svg";
        props.viewBox = "0 0 24 24";
        return e("svg", props,
            e("path", { d: "M0 0h24v24H0V0z", fill: "none" }),
            e("path", { d: "M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" })
        );
    },
    add: (props = {}) => {
        props.xmlns = "http://www.w3.org/2000/svg";
        props.viewBox = "0 0 24 24";
        return e("svg", props,
            e("path", { d: "M0 0h24v24H0V0z", fill: "none" }),
            e("path", { d: "M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z" })
        );
    },

    stop: (props = {}) => {
        props.xmlns = "http://www.w3.org/2000/svg";
        props.viewBox = "0 0 24 24";
        props.enableBackground = "new 0 0 24 24";

        return e("svg", props,
            e("g", {},
                e("path", { d: "M0,0h24v24H0V0z", fill: "none" })),
            e("g", {},
                e("path", { d: "M15.73,3H8.27L3,8.27v7.46L8.27,21h7.46L21,15.73V8.27L15.73,3z M19,14.9L14.9,19H9.1L5,14.9V9.1L9.1,5h5.8L19,9.1V14.9z M14.83,7.76L12,10.59L9.17,7.76L7.76,9.17L10.59,12l-2.83,2.83l1.41,1.41L12,13.41l2.83,2.83l1.41-1.41L13.41,12l2.83-2.83 L14.83,7.76z" })),
        );
    },

    menu: (props = {}) => {
        props.xmlns = "http://www.w3.org/2000/svg";
        props.viewBox = "0 0 24 24";
        /**
         * 
         * <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
         *      <path d="M0 0h24v24H0V0z" fill="none"/>
         *      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
         * </svg>
         * 
         * <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
         *      <path d="M0 0h24v24H0V0z" fill="none"/>
         *      <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
         * </svg>
         * 
         * 
         * 
         * <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0V0z" fill="none"/>
         *      <path d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1z"/>
         * </svg>
         */
        return e("svg", props,
            e("path", { d: "M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1z" })
        );
    }
}


ReactDOM.render(e(MainPage), document.getElementById("content"));