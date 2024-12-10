import React, {useEffect, useState} from 'react';
import {Avatar, Button, Card, Col, Divider, Form, Input, List, message, Modal, Row, Select, Space, Tag} from 'antd';
import {AttributeDefinition, KeySchemaElement, TableDescription} from "@aws-sdk/client-dynamodb/dist-types/models";
import {useRouter} from 'next/router'
import {MinusCircleOutlined, PlusOutlined} from "@ant-design/icons";
import { Typography } from 'antd';

const { Title } = Typography;

const layout = {
    labelCol: {span: 8},
    wrapperCol: {span: 20},
};
const labelCol = {span: 10, offset: 2};

const tailLayout = {
    wrapperCol: {offset: 8, span: 12},
};

const {Meta} = Card;

type FormTableType = {
    TableName: string;
    AttributeDefinitions_data: AttributeDefinition[];
    KeySchema_data: KeySchemaElement[];
};
const DynamoDBTables: React.FC = () => {
    const [tables, setTables] = useState<TableDescription[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
        form.resetFields();
    };
    const router = useRouter();
    const [form] = Form.useForm();

    const onFinish = async ({TableName, KeySchema_data}: FormTableType) => {
        console.log();
        const AttributeDefinitions = [...KeySchema_data]
        const KeySchema = KeySchema_data.map(
            ({AttributeName}) => ({AttributeName, KeyType: "HASH"})
        );
        if (KeySchema.length === 2) KeySchema[1].KeyType = "RANGE";
        setIsModalOpen(false);
        const table = {TableName, AttributeDefinitions, KeySchema,
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1,
            }};
        fetch('/api/dynamodb/create_table', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(table)
        }).then(async response => {
            if (response.status === 200) {
                const res = await response.json();
                console.log('aaa', res);
                if (res["$metadata"].httpStatusCode === 200) {
                    message.success('Inserted ' + JSON.stringify(res.TableDescription));
                    setTables([...tables, res.TableDescription]);
                }

            } else message.error(
                `Failed to insert:\n ${JSON.stringify(await response.json())}`);
        }).catch(res => {
            message.error(res)
        })
    }
    const onReset = () => {
        form.resetFields();
    };


    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };


    useEffect(() => {
        fetch('api/dynamodb/all_tables', {method: "GET"})
            .then(res => {
                res.json().then(
                    (json => {
                        setTables(json)
                    })
                )
            })
    }, [])

    return (
        <>
            <Button type="primary" onClick={showModal}>
                Add New DynamoDB Table
            </Button>
            <Divider/>
            <Modal title="Basic Modal" onCancel={handleCancel}
                   open={isModalOpen} footer={null} width={1000}>
                <Form
                    {...layout}
                    form={form}
                    name="control-hooks"
                    onFinish={onFinish}
                    style={{maxWidth: 800}}
                >
                    <Form.Item name="TableName" label="TableName" rules={[{required: true}]}>
                        <Input placeholder={'Please give a table name'}/>
                    </Form.Item>

                    <Divider/>
                    <Title type="warning" level={4}>{"Key attributions can't be zero or  exceed 2 and we are only dealing with KeyAttributes for this demo"}</Title>
                    {/*<Tag color="volcano">{"Key attributions can't exceed 2"}</Tag>*/}
                    <Form.List name="KeySchema_data" initialValue={[null]}>

                        {(fields, {add, remove}) => (
                            <>
                                {fields.map(({key, name, ...restField}) => (
                                    <Row key={key} style={{background: "white"}}>
                                        <Col span={11}>
                                            <Form.Item
                                                labelCol={labelCol}
                                                label="KeyAttributeName"
                                                {...restField}
                                                name={[name, 'AttributeName']}
                                                rules={[{required: true, message: 'Missing AttributeName'}]}
                                            >
                                                <Input placeholder="Atrribute Name"/>
                                            </Form.Item>
                                        </Col>
                                        <Col span={11}>
                                            <Form.Item
                                                label="KeyAttributeType"
                                                labelCol={labelCol}
                                                {...restField}
                                                name={[name, 'AttributeType']}
                                                rules={[{required: true, message: 'Missing AttributeType'}]}
                                            >
                                                {/*<Input placeholder="Atrribute Value Type" />*/}
                                                <Select>
                                                    <Select.Option value="S">String</Select.Option>
                                                    <Select.Option value="N">Number</Select.Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={2}>
                                            {fields.length > 1 && <MinusCircleOutlined onClick={() => remove(name)}/>}
                                        </Col>
                                    </Row>
                                ))}
                                <Form.Item>
                                    {fields.length < 2 &&<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined/>}>
                                        Add Key AttributeDefinition
                                    </Button>}
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Divider/>

                    {/*<Form.List name="AttributeDefinitions_data">*/}
                    {/*    {(fields, {add, remove}) => (*/}
                    {/*        <>*/}
                    {/*            {fields.map(({key, name, ...restField}) => (*/}
                    {/*                <Row key={key} style={{background: "white"}}>*/}
                    {/*                    <Col span={11}>*/}
                    {/*                        <Form.Item*/}
                    {/*                            labelCol={labelCol}*/}
                    {/*                            label="AttributeName"*/}
                    {/*                            {...restField}*/}
                    {/*                            name={[name, 'AttributeName']}*/}
                    {/*                            rules={[{required: true, message: 'Missing AttributeName'}]}*/}
                    {/*                        >*/}
                    {/*                            <Input placeholder="Atrribute Name"/>*/}
                    {/*                        </Form.Item>*/}
                    {/*                    </Col>*/}
                    {/*                    <Col span={11}>*/}
                    {/*                        <Form.Item*/}
                    {/*                            label="AttributeType"*/}
                    {/*                            labelCol={labelCol}*/}
                    {/*                            {...restField}*/}
                    {/*                            name={[name, 'AttributeType']}*/}
                    {/*                            rules={[{required: true, message: 'Missing AttributeType'}]}*/}
                    {/*                        >*/}
                    {/*                            /!*<Input placeholder="Atrribute Value Type" />*!/*/}
                    {/*                            <Select>*/}
                    {/*                                <Select.Option value="S">String</Select.Option>*/}
                    {/*                                <Select.Option value="N">Number</Select.Option>*/}
                    {/*                            </Select>*/}
                    {/*                        </Form.Item>*/}
                    {/*                    </Col>*/}
                    {/*                    <Col span={2}>*/}
                    {/*                        <MinusCircleOutlined onClick={() => remove(name)}/></Col>*/}
                    {/*                </Row>*/}
                    {/*            ))}*/}
                    {/*            <Form.Item>*/}
                    {/*                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined/>}>*/}
                    {/*                    Add AttributeDefinition*/}
                    {/*                </Button>*/}
                    {/*            </Form.Item>*/}
                    {/*        </>*/}
                    {/*    )}*/}
                    {/*</Form.List>*/}

                    <Form.Item {...tailLayout} >
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                        <Button htmlType="button" onClick={onReset}>
                            Reset
                        </Button>
                        <Button htmlType="button" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <List
                // itemLayout="horizontal"
                grid={{gutter: 16, column: 3}}
                dataSource={tables}
                renderItem={({TableName, AttributeDefinitions, CreationDateTime}, index) => (
                    <List.Item>
                        <Card
                            hoverable
                            onClick={() => {
                                router.push(`/dynamodb/${TableName}`)
                            }}
                            title={TableName}>
                            <Meta
                                avatar={<Avatar
                                    src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index}`}/>}
                                // title="Card title"
                                description={JSON.stringify(
                                        AttributeDefinitions?.map(a => a.AttributeName))
                                    +
                                    JSON.stringify(CreationDateTime)
                                }
                            />
                        </Card>
                    </List.Item>
                )}
            />
        </>
    )
};

export default DynamoDBTables;
