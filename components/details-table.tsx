import { Table } from 'antd';
// import { IExpenses } from 'Components/interface';

interface IProps {
    data: any[];
    columns: {
        title: string;
        dataIndex: string;
        key: string;
        sorter?: (a: any, b: any) => number,
        render?: (text: string, record: any) => JSX.Element
    }[];
}
const DetailsTable  = (props: IProps): JSX.Element => {
    const { data, columns } = props;

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey='id'
            pagination={{ pageSize: 5 }}
            // scroll={{ y: 240 }}
        />
    );
};

export default DetailsTable;