import { useEffect, useState, useLayoutEffect } from "react";
import { useOutlet } from "react-router-dom";
import { Layout } from "antd";

function SetupProjectLaoyt() {
    const {  Content } = Layout;
    const outlet = useOutlet();
  return (
    <Layout>
        <Content className="setupProjectContent">
            {outlet} 
        </Content>
    </Layout>
  );
}

export default SetupProjectLaoyt;
