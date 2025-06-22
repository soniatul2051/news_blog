import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  message,
  Image,
  AutoComplete,
} from "antd";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { OnEdit as onEditContext } from "../../../Context";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../../API";
import moment from "moment/moment";
import { AntDesignOutlined, FileImageOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const defaultFilterObject = {
  date: "",
  newsType: "all",
  type: "all",
  search: "",
  category: "",
  keyword: "",
  id: "",
  reportedBy: "",
  publishBy: "",
  subCategory: "",
};

const { RangePicker } = DatePicker;
const { Option } = Select;

const Dashboard = () => {
  // const Dashboard = ({ isAdmin }) => {
  const [articleData, setArticleData] = useState([]);
  const [filterItem, setfilterItem] = useState("keyword");
  const [filterItemResponse, setfilterItemResponse] =
    useState(defaultFilterObject);
  const [qusetion, setQuestion] = useState("");
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isModalReportedOpen, setIsModalReportedOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [status, setStatus] = useState("OFFLINE");
  const { onEdit, setOnEdit, id, setId } = useContext(onEditContext);
  const [visible, setVisible] = useState("");
  const [sortedArticleData, setSortedArticleData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigation = useNavigate();
  const [categoryOptions, setCategoryOptions] = useState();
  const [subCategoryOptions, setSubCategoryOptions] = useState();
  const [allPublishedBy, setAllPublishedBy] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/user?id=${localStorage.getItem("id")}`)
      .then((user) => {
        if (user.data[0].role === "admin") {
          setIsAdmin(true);
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${API_URL}/content?type=category`)
      .then((content) => {
        let arr = [];
        for (let i = 0; i < content.data.length; i++) {
          const element = content.data[i];
          arr.push({
            key: element._id,
            value: element.text,
            label: element.text,
          });
        }
        // let values = arr.map((item) => item?.label);
        setCategoryOptions(arr);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${API_URL}/subcategory?category=${filterItemResponse.category}`)
      .then((content) => {
        let arr = [];
        for (let i = 0; i < content.data.length; i++) {
          const element = content.data[i];
          arr.push({
            key: element._id,
            value: element.text,
            label: element.text,
          });
        }
        setSubCategoryOptions(arr);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [filterItemResponse.category]);

  const getAllArticles = () => {
    axios.get(`${API_URL}/article`).then((article) => {
      setArticleData(article.data);

      // Extract 'publishedBy' and filter out duplicates
      const publishedByArray = article?.data?.map((item) => item.publishBy);
      const uniquePublishedBy = [...new Set(publishedByArray)];

      // Update the state
      setAllPublishedBy(uniquePublishedBy);
    });
  };

  useEffect(() => {
    getAllArticles();
  }, [axios]);

  const stripHtmlTags = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  // const handleStatusUpdate = (articleId, newStatus) => {
  //   // Make an API call to update the status
  //   axios
  //     .put(`${API_URL}/article/${articleId}`, { status: newStatus })
  //     .then((response) => {
  //       // Handle success
  //       message.success("Article Status Updated Successfully");
  //       // Refresh the article data
  //       axios.get(`${API_URL}/article`).then((article) => {
  //         setArticleData(article.data.reverse());
  //       });
  //     })
  //     .catch((error) => {
  //       // Handle error
  //       console.error("Error updating article status", error);
  //       message.error("Failed to update article status");
  //     });
  // };

  const handleToggleStatus = (articleId, currentStatus) => {
    const newStatus = currentStatus === "online" ? "offline" : "online";

    // Make an API call to update the status
    axios
      .put(`${API_URL}/article/${articleId}`, { status: newStatus })
      .then(() => {
        // Handle success
        message.success(`Article Status Changed to ${newStatus.toUpperCase()}`);
        // Refresh the article data
        axios.get(`${API_URL}/article`).then((article) => {
          setArticleData(article.data.reverse());
        });
        getAllArticles();
      })
      .catch((error) => {
        // Handle error
        console.error("Error updating article status", error);
        message.error("Failed to update article status");
      });
  };
  const handleDeleteCancel = () => {
    setIsModalDeleteOpen(false);
    setCurrentUser({});
  };
  const ShowDeleteModal = (user) => {
    setCurrentUser(user);
    setIsModalDeleteOpen(true);
  };
  const handleReportedCancel = () => {
    setIsModalReportedOpen(false);
    setCurrentUser({});
  };
  const ShowReportedModal = (user) => {
    setCurrentUser(user);
    setIsModalReportedOpen(true);
  };
  // const onFilter = () => {
  //   let filter = "";
  //   for (let i = 0; i < filterItemResponse.length; i++) {
  //     const element = filterItemResponse[i];
  //     filter += `${element.main}=${element.value}&`;
  //   }
  //   console.log(filter);

  //   axios
  //     .get(`${API_URL}/article?${filter}`)
  //     .then((article) => {
  //       setArticleData(article?.data);
  //       console.log(article);
  //       setfilterItemResponse([]);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };
  const onResetFilter = () => {
    setfilterItemResponse(defaultFilterObject);
    axios.get(`${API_URL}/article`).then((article) => {
      setArticleData(article.data);
    });
  };

  const onFilter = () => {
    if (!filterItemResponse) {
      console.error("filterItemResponse is null or undefined");
      return;
    }
    const obj = filterItemResponse;
    let filter = "";
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        // console.log("Property: " + key + ", Value: " + obj[key]);
        if (key === "date" && obj[key]) {
          filter = `${key}=${obj[key].join(",")}&`;
        } else if (key === "newsType" && obj[key] === "all") {
          // Skip filtering for "All" option in newsType
        } else if (key === "type" && obj[key] === "all") {
          // Skip filtering for "All" option in newsType
        } else if (obj[key]) {
          filter += `${key}=${obj[key]}&`;
        }
      }
    }

    axios
      .get(`${API_URL}/article?${filter}`)
      .then((article) => {
        setArticleData(article?.data);

        // setfilterItemResponse(defaultFilterObject);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const OnDelete = () => {
    axios
      .delete(`${API_URL}/article?id=${currentUser._id}`)
      .then(() => {
        message.success("Article Has Successfully Deleted");
        setCurrentUser("");
        setIsModalDeleteOpen(false);
        getAllArticles();
      })
      .catch((err) => {
        console.log(err);
        message.error("Article Has Not Deleted");
        setCurrentUser("");
        setIsModalDeleteOpen(false);
      });
  };
  const OnReported = () => {
    axios
      .post(`${API_URL}/report`, {
        adminId: localStorage.getItem("id"),
        userId: currentUser.UserID,
        articleId: currentUser._id,
        question: qusetion,
      })
      .then(() => {
        message.success("Article Was Successfully Reported");
        setCurrentUser("");
        setIsModalReportedOpen(false);

        setQuestion("");
      })
      .catch((err) => {
        console.log(err);
        message.error("Article Was Not Successfully Reported");
        setCurrentUser("");
        setIsModalReportedOpen(false);
      });
  };

  useEffect(() => {
    // Initialize serial numbers when the component mounts or when the data changes
    const initialSerialNumbers = articleData.map((_, index) => index + 1);
    setSortedArticleData(initialSerialNumbers);
  }, [articleData]);

  const handleSort = (column) => {
    const { dataIndex, sortOrder } = column;

    // Create a copy of the current serial numbers
    const newSerialNumbers = [...sortedArticleData];

    // Sort the serial numbers based on the selected column
    newSerialNumbers.sort((a, b) => {
      const valueA = articleData[a - 1][dataIndex];
      const valueB = articleData[b - 1][dataIndex];

      if (sortOrder === "ascend") {
        return valueA - valueB;
      } else if (sortOrder === "descend") {
        return valueB - valueA;
      }

      return 0;
    });

    // Update the state with the new serial numbers
    setSortedArticleData(newSerialNumbers);
  };

  const columns = [
    {
      title: "Serial No.",
      dataIndex: "serialNumber",
      key: "serialNumber",
      render: (_, record) => (
        <div style={{ width: "70px" }}>{record.serialNumber}</div>
      ),
      sorter: (a, b) => a.serialNumber - b.serialNumber,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "News Id",
      dataIndex: "_id",
      key: "_id",
      render: (value) => {
        return (
          <div
            style={{
              width: "140px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textAlign: "start",
            }}
          >
            {value}
          </div>
        );
      },
      sorter: (a, b) => a._id.localeCompare(b._id),
    },
    {
      title: "Date",
      key: "createdAt",
      dataIndex: "createdAt",
      render: (date) => (
        <div style={{ width: "150px" }}>
          {moment(date).format("DD-MM-YYYY hh:mm A")}
        </div>
      ),
      sorter: (a, b) => moment(a.createdAt) - moment(b.createdAt),
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (_, { type, image, _id }) => {
        const isImage = type === "img";

        return (
          <>
            {isImage ? (
              <Image
                width={100}
                style={{
                  width: "100px",
                  height: "100px",
                }}
                src={image || ""}
                preview={{
                  visible: _id === visible,
                  src: image || "",
                  onVisibleChange: (value) => {
                    setVisible(visible ? "" : _id);
                  },
                }}
              />
            ) : (
              <video
                style={{
                  width: "100px",
                  height: "100px",
                }}
                src={image || ""}
              />
              // <div
              //   style={{
              //     width: "100px",
              //     height: "100px",
              //     display: "flex",
              //     alignItems: "center",
              //     justifyContent: "center",
              //   }}
              // >
              //   <FileImageOutlined
              //     style={{ fontSize: "24px", color: "#ccc" }}
              //   />
              // </div>
            )}
          </>
        );
      },
    },

    {
      title: "Headline",
      dataIndex: "title",
      key: "title",
      render: (text) => {
        let tt = "";
        if (tt.length < 15) {
          for (let icon = 0; icon < text?.length; icon++) {
            const element = text[icon];
            tt += element;
          }
        }
        return <a>{tt + "..."}</a>;
      },
    },
    {
      title: "Actions",
      key: "action",
      render: (user) => {
        // console.log("sssssssssssssssssssssssssssss",user)

        return (
          <Space size="middle">
            <a
              onClick={() => {
                setOnEdit(true);
                setId(user._id);

                navigation("/dashboard/upload?edit=true");
              }}
            >
              edit
            </a>
            <a
              onClick={() => {
                ShowDeleteModal(user);
              }}
            >
              Delete
            </a>
            {isAdmin ? (
              <a onClick={() => ShowReportedModal(user)}>Report Article</a>
            ) : (
              <></>
            )}
          </Space>
        );
      },
    },
    {
      title: "Category",
      key: "topic",
      render: (topic) => {
        // console.log("topic in colomn : ", topic);

        return <a>{topic?.topic}</a>;
      },
    },
    {
      title: "News Type",
      key: "newsType",
      dataIndex: "publish",
      render: (data, { newsType }) => (
        <a>{newsType ? newsType : "breakingNews"}</a>
      ),
    },
    {
      title: "News",
      dataIndex: "discription",
      key: "discription",
      render: (text) => {
        let tt = "";
        let times = text ? (text.length > 50 ? 50 : text.length) : 0;

        for (let icon = 0; icon < times; icon++) {
          tt += text[icon];
        }

        // Strip HTML tags from the content
        const strippedText = stripHtmlTags(tt);

        return <a>{strippedText + "..."}</a>;
      },
    },

    {
      title: "Content Type",
      key: "type",
      dataIndex: "type",
      render: (_, { type }) => (
        <>
          <Tag color={"gold"}>
            {type == "img" ? "Image" : type == "vid" ? "Video" : "Image"}
          </Tag>
        </>
      ),
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: () => (
        <>
          <Tag color={"green"}>LIVE</Tag>
        </>
      ),
    },
    {
      title: "Online / Offline",
      key: "status",
      dataIndex: "status",
      render: (_, article) => (
        <>
          <Tag color={article.status === "online" ? "cyan" : "red"}>
            {article.status === "online" ? "ONLINE" : "OFFLINE"}
          </Tag>
          <Button
            type="link"
            onClick={() => handleToggleStatus(article._id, article.status)}
            style={{ padding: "auto 0px", margin: "10px 0px" }}
          >
            Change Status
          </Button>
        </>
      ),
    },

    {
      title: "Tags",
      key: "keyWord",
      dataIndex: "keyWord",
      render: (_, { keyWord }) => (
        <>
          {Array.isArray(keyWord) &&
            keyWord.map((e, index) => (
              <Tag color="blue" key={index}>
                {e}
              </Tag>
            ))}
        </>
      ),
    },

    {
      title: "Reported By",
      key: "reportedBy",
      dataIndex: "Reported",
      render: (data, { reportedBy }) => (
        <a>{reportedBy ? reportedBy : "Agencies"}</a>
      ),
    },
    // {
    //   title: "Published By",
    //   key: "publishBy",
    //   dataIndex: "publish",
    //   render: (data, { publishBy }) => <a>{publishBy ? publishBy : "Admin"}</a>,
    // },
    {
      title: "Published By",
      key: "publishBy",
      dataIndex: "publish",
      render: (data, { publishBy }) => {
        // Log the value to the console
        // console.log("Publish By:", publishBy);

        return <a>{publishBy ? publishBy : "admin@gmail.com"}</a>;
      },
    },
    {
      title: "Language",
      key: "language",
      dataIndex: "language",
      render: (data) => (
        <>
          <Tag>{data?.language ? data.language : "English"}</Tag>
        </>
      ),
    },
  ];

  // console.log("sorted articledata  : ", articleData);

  const dataWithSerialNumbers = sortedArticleData.map((serialNumber) => ({
    ...articleData[serialNumber - 1],
    serialNumber,
  }));

  const filterOption = (inputValue, option) =>
    option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;

  // dropdown
  const publishAndReportedByArray = articleData?.map((article) => ({
    publishBy: article.publishBy,
    reportedBy: article.reportedBy,
  }));

  // Extract unique reportedBy values
  const uniqueReportedBy = [
    ...new Set(publishAndReportedByArray.map((item) => item.reportedBy)),
  ];
  // Extract unique publishBy values
  const uniquePublishBy = [
    ...new Set(publishAndReportedByArray.map((item) => item.publishBy)),
  ];
  // console.log("published by, : ", uniquePublishBy, filterItemResponse);
  return (
    <>
      <h1
        style={{
          color: "rgba(0,0,0,0.8)",
          marginBottom: 10,
          textAlign: "left",
          fontFamily: "Poppins",
        }}
      >
        Articles
      </h1>
      <Card>
        <Row gutter={12}>
          <Col span={6}>
            <RangePicker
              style={{ width: "100%" }}
              // placeholder="By Date"
              value={
                filterItemResponse.date
                  ? [
                      moment(filterItemResponse.date[0]),
                      moment(filterItemResponse.date[1]),
                    ]
                  : ""
              }
              onChange={(_, dateString) => {
                // console.log(dateString);
                setfilterItemResponse({
                  ...filterItemResponse,
                  date: dateString,
                });
              }}
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: "100%" }}
              value={filterItemResponse.newsType}
              onChange={(e) =>
                setfilterItemResponse({ ...filterItemResponse, newsType: e })
              }
              options={[
                {
                  value: "all",
                  label: "All",
                },
                {
                  value: "breakingNews",
                  label: "Breaking News",
                },
                {
                  value: "topStories",
                  label: "Top Stories",
                },
                {
                  value: "upload",
                  label: "Upload",
                },
              ]}
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: "100%" }}
              value={filterItemResponse.type}
              onChange={(e) =>
                setfilterItemResponse({ ...filterItemResponse, type: e })
              }
              options={[
                {
                  value: "all",
                  label: "All",
                },
                {
                  value: "img",
                  label: "Images / Text",
                },
                {
                  value: "vid",
                  label: "Videos",
                },
              ]}
            />
          </Col>

          <Col span={6}>
            <Input
              onChange={(e) =>
                setfilterItemResponse({
                  ...filterItemResponse,
                  search: e.target.value,
                })
              }
              value={filterItemResponse.search}
              placeholder="Headline"
              style={{ width: "100%" }}
            />
          </Col>
          <Col span={6} style={{ marginTop: 10 }}>
            {/* <Input
            value={filterItemResponse.category}
              onChange={(e) =>
                setfilterItemResponse({...filterItemResponse,category:e.target.value})
                
                
              }
              placeholder="Category"
              style={{ width: "100%" }}
            /> */}
            <AutoComplete
              style={{ width: "100%" }}
              options={categoryOptions?.map((option) => ({
                value: option.value,
              }))}
              filterOption={categoryOptions}
              placeholder="Category"
              value={filterItemResponse.category}
              onChange={(value) =>
                setfilterItemResponse({
                  ...filterItemResponse,
                  category: value,
                })
              }
              onSelect={(value) => {
                setfilterItemResponse({
                  ...filterItemResponse,
                  category: value,
                });
              }}
            />
          </Col>

          <Col span={6} style={{ marginTop: 10 }}>
            <AutoComplete
              placeholder="Sub Category"
              style={{ width: "100%" }}
              options={subCategoryOptions?.map((option) => ({
                value: option.value,
              }))}
              filterOption={subCategoryOptions}
              value={filterItemResponse.subCategory}
              onChange={(value) =>
                setfilterItemResponse({
                  ...filterItemResponse,
                  subCategory: value,
                })
              }
              onSelect={(value) => {
                setfilterItemResponse({
                  ...filterItemResponse,
                  subCategory: value,
                });
              }}
            />
          </Col>
          <Col style={{ marginTop: 10 }} span={6}>
            <Input
              value={filterItemResponse.keyword}
              onChange={(e) =>
                setfilterItemResponse({
                  ...filterItemResponse,
                  keyword: e.target.value,
                })
              }
              placeholder="Tags"
              style={{ width: "100%" }}
            />
          </Col>
          <Col style={{ marginTop: 10 }} span={6}>
            <Input
              value={filterItemResponse.id}
              onChange={(e) =>
                setfilterItemResponse({
                  ...filterItemResponse,
                  id: e.target.value.trim(),
                })
              }
              placeholder="Id"
              style={{ width: "100%" }}
            />
          </Col>

          {/* new cols */}

          <Col style={{ marginTop: 10 }} span={6}>
            <label>Reported By</label>
            <Select
              value={filterItemResponse.reportedBy}
              onChange={(value) =>
                setfilterItemResponse({
                  ...filterItemResponse,
                  reportedBy: value,
                })
              }
              placeholder="Reported By"
              style={{ width: "100%" }}
            >
              {uniqueReportedBy.map((option, index) => (
                <Option key={index} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Col>

          <Col style={{ marginTop: 10 }} span={6}>
            <label>Published By</label>
            <Select
              value={filterItemResponse.publishBy}
              onChange={(value) =>
                setfilterItemResponse({
                  ...filterItemResponse,
                  publishBy: value,
                })
              }
              placeholder="Published By"
              style={{ width: "100%" }}
            >
              {uniquePublishBy.map((option, index) => (
                <Option key={index} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Col>

          <Col style={{ marginTop: 30 }} span={4}>
            <Button style={{ width: "100%" }} type="primary" onClick={onFilter}>
              Filter
            </Button>
          </Col>
          <Col style={{ marginTop: 30 }} span={4}>
            <Button
              style={{ width: "100%", backgroundColor: "red" }}
              type="primary"
              onClick={onResetFilter}
            >
              Reset
            </Button>
          </Col>

          <Col span={24} style={{ marginTop: "20px" }}>
            <Table
              scroll={{ x: 1300 }}
              columns={columns}
              dataSource={dataWithSerialNumbers}
              onChange={handleSort}
            />
          </Col>
        </Row>
      </Card>
      <Modal
        title="Delete User"
        open={isModalDeleteOpen}
        onOk={OnDelete}
        onCancel={handleDeleteCancel}
        okText="Yes"
      >
        <div
          style={{
            margin: "20px 0",
            textAlign: "center",
            color: "red",
            fontSize: 30,
            fontWeight: "700",
          }}
        >
          Are You Sure
        </div>
      </Modal>
      <Modal
        title="Report User"
        open={isModalReportedOpen}
        onOk={OnReported}
        onCancel={handleReportedCancel}
        okText="Report"
      >
        <TextArea
          style={{ width: "100%", height: "100px", margin: "10px 0" }}
          showCount
          maxLength={200}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default Dashboard;

/* <Col span={6}>
            <Select
              style={{ width: "100%" }}
              defaultValue="keyword"
              onChange={(e) => setfilterItem(e)}
              options={[
                {
                  value: "keyword",
                  label: "By Tags",
                },
                {
                  value: "category",
                  label: "By Category",
                },
                {
                  value: "search",
                  label: "By Headline",
                },
                {
                  value: "id",
                  label: "By ID",
                },
                {
                  value: "date",
                  label: "By Date",
                },
                {
                  value: "newsType",
                  label: "News Type",
                },
                {
                  value: "type",
                  label: "Content Type",
                },
              ]}
            />
          </Col> */
// <Col span={6}>
//             <RangePicker
//               style={{ width: "100%" }}
//               // placeholder="By Date"
//               onChange={(_, dateString) => {
//                 console.log(dateString);
//                 setfilterItemResponse([
//                   ...filterItemResponse,
//                   { value: dateString, main: "date" },
//                 ]);
//               }}
//             />
//           </Col>
//           <Col span={6}>
//             <Select
//               style={{ width: "100%" }}
//               defaultValue="all"
//               onChange={(e) =>
//                 setfilterItemResponse([
//                   ...filterItemResponse,
//                   { value: e, main: "newsType" },
//                 ])
//               }
//               options={[
//                 {
//                   value: "all",
//                   label: "All",
//                 },
//                 {
//                   value: "breakingNews",
//                   label: "Breaking News",
//                 },
//                 {
//                   value: "topStories",
//                   label: "Top Stories",
//                 },
//               ]}
//             />
//           </Col>
//           <Col span={6}>
//             <Select
//               style={{ width: "100%" }}
//               defaultValue="img"
//               onChange={(e) =>
//                 setfilterItemResponse([
//                   ...filterItemResponse,
//                   { value: e, main: "type" },
//                 ])
//               }
//               options={[
//                 {
//                   value: "img",
//                   label: "Images / Text",
//                 },
//                 {
//                   value: "vid",
//                   label: "Videos",
//                 },
//               ]}
//             />
//           </Col>

//           <Col span={6}>
//             <Input
//               onChange={(e) =>
//                 setfilterItemResponse([
//                   ...filterItemResponse,
//                   { value: e.target.value, main: "search" },
//                 ])
//               }
//               placeholder="headline"
//               style={{ width: "100%" }}
//             />
//           </Col>
//           <Col span={6} style={{ marginTop: 10 }}>
//             <Input
//               onChange={(e) =>
//                 setfilterItemResponse([
//                   ...filterItemResponse,
//                   {
//                     value: e.target.value,
//                     main: "category",
//                   },
//                 ])
//               }
//               placeholder="category"
//               style={{ width: "100%" }}
//             />
//           </Col>
//           <Col style={{ marginTop: 10 }} span={6}>
//             <Input
//               onChange={(e) =>
//                 setfilterItemResponse([
//                   ...filterItemResponse,
//                   {
//                     value: e.target.value,
//                     main: "keyword",
//                   },
//                 ])
//               }
//               placeholder="tags"
//               style={{ width: "100%" }}
//             />
//           </Col>
//           <Col style={{ marginTop: 10 }} span={6}>
//             <Input
//               onChange={(e) =>
//                 setfilterItemResponse([
//                   ...filterItemResponse,
//                   { value: e.target.value, main: "id" },
//                 ])
//               }
//               placeholder="id"
//               style={{ width: "100%" }}
//             />
//           </Col>
//           <Col style={{ marginTop: 10 }} span={4}>
//             <Button style={{ width: "100%" }} type="primary" onClick={onFilter}>
//               Filter
//             </Button>
//           </Col>
//           <Col span={24}>
//             <Table
//               scroll={{ x: 1300 }}
//               columns={columns}
//               dataSource={dataWithSerialNumbers}
//               onChange={handleSort}
//             />
//           </Col>

// onFilter
// for (let i = 0; i < filterItemResponse.length; i++) {
//   const element = filterItemResponse[i];
//   console.log("***************element",element)
//   if (element.main === "date" && element.value) {
//     filter = `${element.main}=${element.value.join(",")}&`;
//   } else if (element.main === "newsType" && element.value === "all") {
//     // Skip filtering for "All" option in newsType
//   } else {
//     filter += `${element.main}=${element.value}&`;
//   }
// }
// console.log(filter);
