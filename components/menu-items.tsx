import {Icon, Menu} from "antd";

interface IProps {
    handleLogOut: () => void;
    photoURL?: string|null;
    displayName: string|null;
}

const MenuItems = (props:IProps) => {
    const { handleLogOut, displayName, photoURL = null } = props;
    const handleMenuChange = ({ key }: { key: string}) => {
        if (key === 'logOut') {
            handleLogOut();
        }
    };

    return (
        <Menu
            defaultSelectedKeys={['mail']}
            mode="horizontal"
            onClick={handleMenuChange}
        >
            <Menu.Item key="mail" className='logo-text'>
                {
                    photoURL ?
                        <img src={photoURL!} className='logo-image' /> :
                        <Icon type="user" />
                }
                <span className='logo-text'>{displayName}</span>
            </Menu.Item>
            <Menu.Item key="logOut" className='log-out float-right'>
                <Icon type="mail" />
                Log Out
            </Menu.Item>
        </Menu>
    );
};

export default MenuItems;