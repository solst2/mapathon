import React from 'react'
import ReactTimeout from 'react-timeout'

class Timout extends React.Component {
    state = {
        on: false
    }
    toggle = () => {
        this.props.setTimeout(this.toggle, 1000)
    }
    handleClick = (e) => {
        this.props.setTimeout(this.toggle, 1000) // call the `toggle` function after 5000ms
    }
    render () {
        return (
            <div style={{ backgroundColor: (this.state.on ? 'yellow' : 'gray') }}>
                {this.toggle()}
            </div>
        )
    }
}
export default ReactTimeout(Timout)