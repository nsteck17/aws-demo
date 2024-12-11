
import { Inter } from 'next/font/google'
import {useEffect, useState} from "react";
import {ColumnsType} from "antd/es/table";
import {Button, Form, Input, message, Modal, Select, Space, Table, Tag} from "antd";
import { faker } from '@faker-js/faker';
import {User} from ".prisma/client";

import OcrReader from './OcrReader';
import { createWorker } from 'tesseract.js';

const inter = Inter({ subsets: ['latin'] })

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 12 },
};

export default function Home() {

  let textFromOCR = "";

  /*
      -------- OCR START ---------
  */
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<string>('');
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string>('');

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      await processImage(event);
      console.log("handleImageChange() after processImage() now will readImageText()");
      await readImageText();
      console.log("handleImageChange() after readImageText()");

      // When file is successfully read
      /*
      reader.onloadend = () => {
        if(reader.result){
         setImageBase64(reader.result as string); // Set the Base64 image in the state
         //setImageFile(file); // Optionally, store the file for other purposes (like uploading to server)
        }
      };

      console.log(imageBase64);
      //set image field to base64
      */
    }
  };

  const processImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log("START: processImage()");
      if (event.target.files && event.target.files[0]) {

        await setSelectedImage(event.target.files[0]);

        setOcrResult(''); // Reset OCR result
        setOcrStatus(''); // Reset status

        //TODO: Convert to base64 to save value
        const reader = new FileReader();
        reader.onloadend = async () => {
          if(reader.result){
           setImageBase64(reader.result as string); // Set the Base64 image in the state
           console.log("IMAGE IS SET BASE64");
            await form.setFieldsValue({
              imageBase64: `${reader.result as string}`,
            });
            await readImageText();
            console.log("IMAGE IS SET BASE64 - v2 form set");
          }
        };

        // Read the file as a data URL (Base64 encoded)
        await reader.readAsDataURL(event.target.files[0]);
        //await sleep(3000);

      }
      console.log("END: processImage()");
  }
  const updateFormAfterImage = async () => {
      console.log("set form base64 start");

      console.log("set form base64 end");
  }

  const sleep = (ms:any) => new Promise(r => setTimeout(r, ms));

  const readImageTextDirectly = async (file:any) => {
    console.log("START: readImageTextDirectly()");

    if (!file) return;

    console.log("START: readImageTextDirectly() RUNNING!");

    setOcrStatus('Processing...');
    const worker = await createWorker('eng', 1, {
      logger: m => console.log(m), // Add logger here
    });

    try {
      const {
        data: { text },
      } = await worker.recognize(file);

      form.setFieldsValue({
        ocrResult: `${text}`,
      });

      setOcrResult(text);
      setOcrStatus('Completed');
    } catch (error) {
      console.error(error);
      setOcrStatus('Error occurred during processing.');
    } finally {
      await worker.terminate();
    }
  };

  const readImageText = async () => {
    console.log("START: readImageText()");

    if (!selectedImage) return;

    console.log("START: readImageText() RUNNING!");

    setOcrStatus('Processing...');
    const worker = await createWorker('eng', 1, {
      logger: m => console.log(m), // Add logger here
    });

    try {
      const {
        data: { text },
      } = await worker.recognize(selectedImage);

      form.setFieldsValue({
        ocrResult: `${text}`,
      });

      setOcrResult(text);
      setOcrStatus('Completed');
    } catch (error) {
      console.error(error);
      setOcrStatus('Error occurred during processing.');
    } finally {
      await worker.terminate();
    }
  };
  /*
      -------- OCR END ---------
  */

  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    /*
      form.setFieldsValue({
        imageBase64: `${imageBase64}`,
      });
    */

    console.log('Form Data:', values);
    console.log('Selected File:', selectedImage);


    setIsModalOpen(false);
    fetch('/api/create_user', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    }).then(async response => {
      if (response.status === 200) {
        const user = await response.json();
        message.success('created user ' + user.name);
        setUsers([...users, user]);

      } else message.error(
          `Failed to create user:\n ${JSON.stringify(await response.json())}`);
    }).catch(res=>{message.error(res)})
  };

  const onDelete = async (user: any) => {
    const {id} = user;
    setIsModalOpen(false);
    fetch('/api/delete_user', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id})
    }).then(async response => {
      if (response.status === 200) {
        await response.json();
        message.success('Deleted user ' + user.name);
        setUsers(users.filter(u=> u.id !== id ));

      } else message.error(
          `Failed to delete user:\n ${user.name}`);
    }).catch(res=>{message.error(res)})
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Reported By Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Accident Location',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Image',
      dataIndex: 'imageBase64',
      key: 'imageBase64',
      render: (text) => <img
              src={text}
              alt='Uploaded content'
              width={150}
              style={{ marginTop: 1 }}
            />,
    },
    {
      title: 'Image Text',
      dataIndex: 'ocrResult',
      key: 'ocrResult',
    },

    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
          <Space size="middle">
            <a onClick={()=>onDelete(record)}>Delete</a>
          </Space>
      ),
    },
  ];

  const onReset = () => {
    form.resetFields();
  };

  const onFill = () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName });
    const street = faker.location.streetAddress();
    const city = faker.location.city();
    const state  = faker.location.state({ abbreviated: true });
    const zip = faker.location.zipCode()

    form.setFieldsValue({
      name: `${firstName} ${lastName}`,
      email: email,
      address:
          `${street}, ${city}, ${state}, US, ${zip}`
    });
  };
  const showModal = () => {
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };
  useEffect(()=>{
    fetch('api/all_user', {method: "GET"})
        .then(res => {
          res.json().then(
              (json=> {setUsers(json)})
          )
        })
  }, []);

  if (!users) return "Give me a second";

  return  <>

    <Button type="primary" onClick={showModal}>
      Add Accident
    </Button>
    <Modal title="Basic Modal" onCancel={handleCancel}
           open={isModalOpen} footer={null}  width={800}>
      <Form
          {...layout}
          form={form}
          name="control-hooks"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
      >
        <Form.Item name="name" label="Reported By Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Accident Location" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="selectedImage" label="Upload File" rules={[{ required: true }]}>
          <input type='file' accept='image/*' onChange={handleImageChange} name="selectedImage"/>
            {selectedImage && (
            <img
              src={URL.createObjectURL(selectedImage)}
              alt='Uploaded content'
              width={150}
              style={{ marginTop: 15 }}
            />
          )}
        </Form.Item>
        <Form.Item name="ocrResult" label="ocrResult" rules={[{ required: true }]}>
          <Input name="ocrResult" value="{ocrResult}"/>

        </Form.Item>
        <Form.Item name="imageBase64" label="imageBase64" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

           <button
              onClick={readImageText}
              style={{
                background: '#FFFFFF',
                borderRadius: 7,
                color: '#000000',
                padding: 5,
              }}
            >
            Read Text From Image
          </button>

        <Form.Item {...tailLayout} >

          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
          <Button  htmlType="button" onClick={handleCancel}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
    {/*<p>{JSON.stringify(users)}</p>*/}
    <Table columns={columns} dataSource={users} />;
  </>;


}
