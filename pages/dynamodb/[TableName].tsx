import {useRouter} from 'next/router'
import React, {useEffect, useState} from "react";
import {Button, Divider, Form, Input, InputNumber, message, Modal, Space, Table} from "antd";
import {scan_table} from "@/dynamodb";
import {AttributeDefinition, AttributeValue} from "@aws-sdk/client-dynamodb/dist-types/models";
import {faker} from "@faker-js/faker";
import {ColumnsType} from "antd/es/table";
import {User} from ".prisma/client";
import {DeleteCommandInput} from "@aws-sdk/lib-dynamodb/dist-types/commands";
import {router} from "next/client";

const layout = {
    labelCol: {span: 8},
    wrapperCol: {span: 16},
};

const tailLayout = {
    wrapperCol: {offset: 8, span: 12},
};

export default function DTable() {
    const {TableName} = useRouter().query;
    const [schema, setSchema] = useState<AttributeDefinition[]>([]);
    const [rows, setRows] = useState<Record<string, AttributeValue>[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (row: any) => {
        console.log(row);
        setIsModalOpen(false);
        fetch('/api/dynamodb/insert_item', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({TableName, Item: row})
        }).then(async response => {
            if (response.status === 200) {
                const item = await response.json();
                message.success('Inserted ' + JSON.stringify(item));
                setRows([...rows, row]);

            } else message.error(
                `Failed to insert:\n ${JSON.stringify(await response.json())}`);
        }).catch(res => {
            message.error(res)
        })
    }
    const onReset = () => {
        form.resetFields();
    };

    const showModal = () => {
        setIsModalOpen(true);
        form.resetFields();
    };


    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const onFill = () => {
        const columns: { [k: string]: any } = {}
        for (const {AttributeName, AttributeType} of schema) {
            if (AttributeName) {
                if (AttributeType === 'S')
                    columns[AttributeName] = faker.music.songName();
            }
        }
        form.setFieldsValue(columns);
    };


    useEffect(() => {

        if (typeof TableName === 'string') {
            fetch('/api/dynamodb/scan_table', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({TableName})
            }).then(async (res) => {
                if (res.status !== 200) return;
                const json = await res.json();
                if (json) {
                    const {Table, Items} = json;
                    if (Table.AttributeDefinitions) setSchema(Table.AttributeDefinitions);
                    if (Items) setRows(Items);
                }
            }).catch(e => console.log('aaa', e));
        }
        // if (res)
    }, [TableName])
    if (typeof TableName !== 'string') return <>not a valid table name</>;


    const onDelete = async (item:any) => {
        setIsModalOpen(false);
        const string_item = JSON.stringify(item)
        fetch('/api/dynamodb/delete_item', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({TableName, Key:item})
        }).then(async response => {
            if (response.status === 200) {
                await response.json();
                message.success('Deleted: ' + JSON.stringify(item));
                setRows(rows.filter(
                    row=> JSON.stringify(row) !== string_item ));

            } else message.error(
                `Failed to delete item:\n ${JSON.stringify(item)}`);
        }).catch(res=>{message.error(res)})
    };

    const columns: ColumnsType<any> = schema.map(
        ({AttributeName, AttributeType}) => ({
            title: AttributeName,
            dataIndex: AttributeName,
            key: AttributeName,
            render: (text) => <a>{text}</a>,
        }));

    columns.push(
        {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <a onClick={()=>onDelete(record)}>Delete</a>
            </Space>
        ),
    })

    return (
        <>
            <Button type="primary" onClick={showModal}>
                Add New {TableName} Item
            </Button>
            <Button type="primary" onClick={()=> router.push('/')}>
                Home
            </Button>
            <Divider/>
            <Modal title="Basic Modal" onCancel={handleCancel}
                   open={isModalOpen} footer={null} width={800}>
                <Form
                    {...layout}
                    form={form}
                    name="control-hooks"
                    onFinish={onFinish}
                    style={{maxWidth: 600}}
                >
                    <p>{JSON.stringify(schema)}</p>
                    {schema.map(({AttributeName, AttributeType}, index) =>
                        <Form.Item key={AttributeName}
                                   name={AttributeName} label={AttributeName} rules={[{required: true}]}>
                            {AttributeType === 'S' ?

                                <Input
                                    placeholder={`Give an ${AttributeName}`}
                                />
                                :
                                <InputNumber
                                    placeholder={`Give an ${AttributeName}`}
                                >

                                </InputNumber>
                            }
                        </Form.Item>
                    )}


                    <Form.Item {...tailLayout} >
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                        <Button htmlType="button" onClick={onReset}>
                            Reset
                        </Button>
                        <Button htmlType="button" onClick={onFill}>
                            Fill form
                        </Button>
                        <Button htmlType="button" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Table columns={columns} dataSource={rows} />

        </>
    )
};
