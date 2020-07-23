import React from "react";
import ReactTable from 'react-table'
import axios from 'axios';
import Datetime from 'react-datetime';
import moment from 'moment'
import "react-datepicker/dist/react-datepicker.css";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Card, CardBody, CardTitle } from 'reactstrap';

class Homepage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            userList: [],
            isOpen: false,
            modalData: [],
            startdate: moment(),
            enddate: moment()
        }
    }

    componentDidMount() {
        axios.get('http://localhost:3000/userData')
            .then((response) => {
                this.setState({ userList: response.data })
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    handleClick = (id) => {
        let userList = JSON.stringify(this.state.userList)
        userList = JSON.parse(userList)

        let clickedUser = userList.filter((item) => {
            return item.id == id
        })
        let modalData = clickedUser[0].activity_periods
        this.setState({ isOpen: true, modalData, modalTitle: clickedUser[0].real_name, originalModalData: modalData }, () => {
            this.fliterModalData()
        })
    }

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen,
            startdate: moment(),
            enddate: moment()
        })
    }


    fliterModalData = () => {
        var modalData = [...this.state.originalModalData]
        modalData = modalData.filter((item) => {
            return (this.compareDates(item.start_time) && this.compareDates(item.end_time))
        })
        this.setState({ modalData })
    }

    groupBy = (list, keyGetter) => {
        const map = new Map();
        list.forEach((item) => {
            const key = keyGetter(item);
            const collection = map.get(key);
            if (!collection) {
                map.set(key, [item]);
            } else {
                collection.push(item);
            }
        });
        return map;
    }




    compareDates = (date) => {

        var date = moment(date, "MMM D YYYY H:mm A")
        return moment(date).isBetween(this.state.startdate, this.state.enddate, 'days', '[]')
    }


    onDateChange = (dateType, date) => {
        this.setState({
            [dateType]: date
        }, () => {
            this.fliterModalData()
        })
    }

    render() {

        const columns = [{
            Header: () => (<div className="text-center font-weight-bold">Start time</div>),
            accessor: 'start_time', 
            Cell: (row) => {
                let start_time = moment(row.original.start_time, "MMM D YYYY H:mm A").format(" h:mm A")
                return (
                    <div className="text-center">{start_time}</div>
                )
            }
        }, {
            Header: () => (<div className="text-center font-weight-bold">End time</div>),
            accessor: 'end_time',
            Cell: (row) => {
                let end_time = moment(row.original.end_time, "MMM D YYYY H:mm A").format(" h:mm A")
                return (
                    <div className="text-center">{end_time}</div>
                )
            }
        }]


        let data = JSON.stringify(this.state.modalData)
        data = JSON.parse(data)

        data = data.map((item) => {
            item.date = moment(item.start_time, "MMM D YYYY H:mm A").format("Do MMM YYYY")
            return item
        })
        var result = data.reduce(function (r, a) {
            r[a.date] = r[a.date] || [];
            r[a.date].push(a);
            return r;
        }, Object.create(null));


        return (
            <React.Fragment>

                <div className="user-list-container">
                    <div className="user-list-header mb-3 font-weight-bold">Users</div>
                    {this.state.userList.map((item) => {
                        return (<div title="Click here to view activity periods" className="list-item cursor_pointer" key={item.id} onClick={() => { this.handleClick(item.id) }}>
                            <div className="name-icon">{item.real_name.charAt(0)}</div>
                            {item.real_name}
                        </div>)
                    })}
                </div>
                <Modal isOpen={this.state.isOpen} toggle={this.toggle} >
                    <ModalHeader toggle={this.toggle}>{this.state.modalTitle}</ModalHeader>
                    <ModalBody>
                        <div className="d-flex flex-row-reverse mb-3">
                            <div className="ml-2 d-flex">
                                <div className="pt-2 pr-1">To:</div>
                                <Datetime
                                    value={this.state.enddate}
                                    dateFormat="DD MMM"
                                    timeFormat={false}
                                    input={true}
                                    onChange={(date) => { this.onDateChange('enddate', date) }}
                                    closeOnSelect
                                />
                            </div>
                            <div className="d-flex">
                                <div className="pt-2 pr-1">From:</div>
                                <Datetime
                                    value={this.state.startdate}
                                    dateFormat="DD MMM"
                                    timeFormat={false}
                                    input={true}
                                    onChange={(date) => { this.onDateChange('startdate', date) }}
                                    closeOnSelect
                                />
                            </div>
                            <i className="fa fa-address-book-o" aria-hidden="true"></i>
                        </div>
                        {this.state.modalData.length > 0 ?
                           <div>
                               <div className="text-center font-weight-bold">Activity Periods</div>
                            {Object.keys(result).map((item) => {
                                return (<Card className="user-card">
                                    <CardBody>
                                        <CardTitle>{item}</CardTitle>
                                        <ReactTable
                                            data={result[item]}
                                            columns={columns}
                                            pageSize={result[item].length}
                                            showPagination={false}
                                            loadingText={""}
                                            className=" -highlight"
                                            resizable={false}
                                            showPageSizeOptions={false}
                                            loading={false}
                                        />
                                    </CardBody>
                                </Card>)

                            })}
                           </div>
                            :
                            <div className="text-center">No activity found</div>
                        }
                    </ModalBody>
                </Modal>
            </React.Fragment>

        )
    }
}




export default Homepage;