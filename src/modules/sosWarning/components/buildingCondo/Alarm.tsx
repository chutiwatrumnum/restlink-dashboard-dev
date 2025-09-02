const AlarmIcon = ({nameAlarm}:{nameAlarm:string}) => {
    return (
        <div className="alarm-icon-container">
            <div className="alarm-icon">
                <div className="alarm-bell">
                    <div className="
                        text-white
                        alarm-bell-body text-normal flex items-center 
                        justify-center 
                        text-xs  text-center font-bold
                        absolute inset-0
                    ">
                        {nameAlarm}
                    </div>
                </div>
                <div className="alarm-waves">
                    <div className="alarm-wave wave1"></div>
                    <div className="alarm-wave wave2"></div>
                    <div className="alarm-wave wave3"></div>
                </div>
            </div>
        </div>
    );
};
export default AlarmIcon;