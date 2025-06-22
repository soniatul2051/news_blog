import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { API_URL } from "../../../../API";

const TagsAndCategory = () => {
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterItem, setFilterItem] = useState("all");
  const [subCategory, setSubCategory] = useState("");
  const [cateGet, setCateGet] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [editSequence, setEditSequence] = useState("");
  const [text, setText] = useState("");
  const [type, setType] = useState("tag");
  const [searchValue, setSearchValue] = useState("");
  const [slug, setSlug] = useState("");
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

  // Enhanced Hindi to English transliteration
  const generateSlug = (hindiText) => {
    const translitMap = {
      // Vowels
      'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo',
      'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
      // Consonants
      'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
      'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
      'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
      'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
      'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
      'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
      'ष': 'sh', 'स': 's', 'ह': 'h',
      // Matras (vowel signs)
      'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo',
      'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
      // Punctuation and other marks
      'ं': 'n', 'ः': 'h', '़': '', '्': '', ' ': '-',
      // Numbers
      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
      '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
    };

    let slug = '';
    
    // Convert each Hindi character to its English equivalent
    for (let i = 0; i < hindiText.length; i++) {
      const char = hindiText[i];
      slug += translitMap[char] || char.toLowerCase();
    }

    // Make URL-friendly
    return slug
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/-+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')       // Trim - from start
      .replace(/-+$/, '');      // Trim - from end
  };

  useEffect(() => {
    if (autoGenerateSlug && text) {
      const generatedSlug = generateSlug(text);
      setSlug(generatedSlug);
    }
  }, [text, autoGenerateSlug]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const contentRes = await axios.get(`${API_URL}/content`);
      const subCategoryRes = await axios.get(`${API_URL}/subcategory`);
      const allData = [
        ...contentRes.data.reverse(),
        ...subCategoryRes.data.reverse(),
      ];
      setUserData(allData);
      setFilteredData(allData);
      const categoryRes = await axios.get(`${API_URL}/content?type=category`);
      const categories = categoryRes.data.map((item) => ({
        key: item._id,
        value: item.text,
        label: item.text,
      }));
      setCateGet(categories);
    } catch (err) {
      console.log("Error fetching data", err);
      message.error("Failed to fetch data");
    }
  };

  const onFilter = () => {
    let filteredResults = userData;

    if (filterItem === "tag") {
      filteredResults = filteredResults.filter((item) => item.type === "tag");
    } else if (filterItem === "category") {
      filteredResults = filteredResults.filter(
        (item) => item.type === "category"
      );
    } else if (filterItem === "sub") {
      filteredResults = filteredResults.filter((item) => item.type === "sub");
    }

    if (searchValue.trim() !== "") {
      filteredResults = filteredResults.filter((item) =>
        item.text.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    setFilteredData(filteredResults);
  };

  const onAdd = () => {
    if (!text.trim()) {
      message.error("Please enter a name");
      return;
    }

    if (!slug.trim()) {
      message.error("Please enter a valid slug");
      return;
    }

    if (type !== "sub") {
      axios
        .post(`${API_URL}/content?id=${localStorage.getItem("id")}`, {
          type,
          text,
          slug,
          ...(type === "category" && { sequence: userData?.length + 1 }),
        })
        .then(() => {
          message.success("Successfully Added");
          setIsModalOpen(false);
          setText("");
          setSlug("");
          fetchData();
        })
        .catch((err) => {
          console.log(err);
          message.error(err.response?.data?.message || "Error adding item");
        });
    } else {
      if (!subCategory) {
        message.error("Please select a category");
        return;
      }
      axios
        .post(`${API_URL}/subcategory`, {
          adminId: localStorage.getItem("id"),
          category: subCategory,
          text,
          slug,
        })
        .then(() => {
          message.success("Successfully Added");
          setIsModalOpen(false);
          setText("");
          setSlug("");
          fetchData();
        })
        .catch((err) => {
          console.log(err);
          message.error("Error adding subcategory");
        });
    }
  };

  const onEditSequence = () => {
    if (!editSequence) {
      message.error("Please enter a sequence number");
      return;
    }

    axios
      .put(`${API_URL}/content`, {
        id: selectedData?._id,
        sequence: editSequence,
      })
      .then(() => {
        message.success("Successfully Edited");
        setIsEditModalOpen(false);
        setSelectedData(null);
        setEditSequence("");
        fetchData();
      })
      .catch((err) => {
        console.log(err);
        message.error(err.response.data.err);
      });
  };

  const handleDeleteTagCategory = async (id) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this item?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await axios.delete(`${API_URL}/delete_content/${id}`);
          if (res.data.status === 200) {
            message.success(res.data.message);
            fetchData();
          } else {
            message.error(res.data.message);
          }
        } catch (error) {
          console.log("Error deleting tag/category", error);
          message.error("Error deleting item");
        }
      },
    });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span style={{ fontSize: "12px" }}>{text}</span>,
    },
    {
      title: "Sequence",
      dataIndex: "sequence",
      key: "sequence",
      render: (text, record) => (
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {record.type === "category" ? (
            <>
              <span>{text}</span>
              <a
                onClick={() => {
                  setIsEditModalOpen(true);
                  setSelectedData(record);
                  setEditSequence(text);
                }}
                style={{ marginLeft: "8px" }}
              >
                Edit
              </a>
            </>
          ) : (
            <span>-</span>
          )}
        </div>
      ),
    },
    {
      title: "Name",
      dataIndex: "text",
      key: "text",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (slug) => <Tag color="green">{slug}</Tag>,
    },
    {
      title: filterItem !== "sub" ? "Type" : "Category",
      key: filterItem !== "sub" ? "type" : "category",
      dataIndex: filterItem !== "sub" ? "type" : "category",
      render: (text, record) => (
        <Tag color="geekblue">
          {filterItem !== "sub" ? record.type : record.category}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          danger
          onClick={() => handleDeleteTagCategory(record._id)}
          size="small"
        >
          Delete
        </Button>
      ),
    },
  ];

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setText("");
    setSlug("");
    setSubCategory("");
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "24px" }}>Tags & Categories Management</h1>
      
      <Card>
        <Row gutter={16} style={{ marginBottom: "16px" }}>
          <Col span={6}>
            <Select
              style={{ width: "100%" }}
              value={filterItem}
              onChange={setFilterItem}
              options={[
                { value: "all", label: "All Items" },
                { value: "tag", label: "Tags Only" },
                { value: "category", label: "Categories Only" },
                { value: "sub", label: "Subcategories Only" },
              ]}
            />
          </Col>
          <Col span={12}>
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search by name..."
              allowClear
            />
          </Col>
          <Col span={6}>
            <Button type="primary" onClick={onFilter}>
              Apply Filters
            </Button>
            <Button
              style={{ marginLeft: "8px" }}
              onClick={() => {
                setFilterItem("all");
                setSearchValue("");
                setFilteredData(userData);
              }}
            >
              Reset
            </Button>
          </Col>
        </Row>

        <div style={{ marginBottom: "16px", textAlign: "right" }}>
          <Button
            type="primary"
            onClick={() => {
              setIsModalOpen(true);
              setType("tag"); // Default to tag when opening modal
            }}
          >
            Add New Item
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={type === "tag" ? "Add Tag" : type === "category" ? "Add Category" : "Add Subcategory"}
        open={isModalOpen}
        onOk={onAdd}
        onCancel={handleCancel}
        okText="Save"
        cancelText="Cancel"
        width={600}
      >
        <Row gutter={16}>
          <Col span={24} style={{ marginBottom: "16px" }}>
            <Select
              style={{ width: "100%" }}
              value={type}
              onChange={(value) => {
                setType(value);
                setSubCategory("");
              }}
              options={[
                { value: "tag", label: "Tag" },
                { value: "category", label: "Category" },
                { value: "sub", label: "Subcategory" },
              ]}
            />
          </Col>

          {type === "sub" && (
            <Col span={24} style={{ marginBottom: "16px" }}>
              <Select
                placeholder="Select Parent Category"
                style={{ width: "100%" }}
                value={subCategory}
                onChange={setSubCategory}
                options={cateGet}
                showSearch
                optionFilterProp="label"
              />
            </Col>
          )}

          <Col span={24} style={{ marginBottom: "16px" }}>
            <Input
              placeholder={`Enter ${type} name in Hindi`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              allowClear
            />
          </Col>

          <Col span={24} style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Switch
                checked={autoGenerateSlug}
                onChange={setAutoGenerateSlug}
                style={{ marginRight: "8px" }}
              />
              <span>Auto-generate English slug</span>
            </div>
          </Col>

          <Col span={24}>
            <Input
              placeholder="English slug (URL-friendly)"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setAutoGenerateSlug(false);
              }}
              disabled={autoGenerateSlug}
              allowClear
            />
          </Col>
        </Row>
      </Modal>

      {/* Edit Sequence Modal */}
      <Modal
        title="Edit Sequence Number"
        open={isEditModalOpen}
        onOk={onEditSequence}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditSequence("");
        }}
        okText="Save"
        cancelText="Cancel"
      >
        <Input
          placeholder="Enter sequence number"
          value={editSequence}
          onChange={(e) => setEditSequence(e.target.value.replace(/\D/g, ""))}
          type="number"
        />
      </Modal>
    </div>
  );
};

export default TagsAndCategory;