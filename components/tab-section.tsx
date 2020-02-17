import { Card } from 'antd';
import React  from 'react';

interface ITabSectionProps {
    children: React.ReactNode;
    title: string|React.ReactNode;
    extra: React.ReactNode;
    tabList: { key: string, tab: string }[];
    currentTab: string;
    onTabChange: (key: string) => void;
}

const TabSection = (props: ITabSectionProps): JSX.Element => {
    const {
        children,  title, extra,
        tabList, currentTab, onTabChange
    } = props;
    return (
        <Card
            className='card-content'
            title={title}
            extra={extra}
            tabList={tabList}
            activeTabKey={currentTab}
            onTabChange={key => onTabChange(key) }
        >
            { children }
        </Card>
    );
};

export default TabSection;