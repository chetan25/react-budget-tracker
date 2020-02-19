import { Table } from 'antd';
// import { IExpenses } from 'Components/interface';

interface IProps {
    dataSource: any[];
    columns: {
        title: string;
        dataIndex: string;
        key: string;
        sorter?: (a: any, b: any) => number,
        render?: (text: string, record: any) => JSX.Element
    }[];
    scroll?: {
        [key: string]: number;
    };
}
const DetailsTable  = (props: IProps): JSX.Element => {
    return (
        <Table
            {...props}
            rowKey='id'
            pagination={{ pageSize: 5 }}
        />
    );
};

export default DetailsTable;