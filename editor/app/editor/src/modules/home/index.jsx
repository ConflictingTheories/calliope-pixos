import React from "react";
import { collect, store } from "react-recollect";

// RSuite UI Library
import {
  Container,
  Content,
  Panel,
  Row,
  Col,
  Notification,
  Placeholder,
  List,
} from "rsuite";
import "rsuite/dist/styles/rsuite-default.css";
// Blueprint
import { NonIdealState, Tabs, Tab, Icon } from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
// Misc
import Swal from "sweetalert2";
import "@sweetalert2/themes/dark/dark.min.css";

// Components
import NavBar from "../../components/nav";
import SideMenu from "../../components/menu";
import ScriptEdit from "../../components/script";

// ASSETS & APP STYLES
import "../../theme/less/App.less";

//SERVICES
import { posts, pages, save } from "../../services/content";

const { Paragraph } = Placeholder;

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.edit = this.edit.bind(this);
    this.create = this.create.bind(this);
    this.fetchFileLists = this.fetchFileLists.bind(this);
    this.fetchScript = this.fetchScript.bind(this);
    this.renderCallbacks = this.renderCallbacks.bind(this);
    this.renderTriggers = this.renderTriggers.bind(this);
    this.profilePanel = this.renderPanel.bind(this);
  }

  async componentDidMount() {
    // Fetch & Render Posts
    store.show = false;
    store.isEditting = false;
    store.isSaved = true;
    await this.fetchFileLists();
    setTimeout(
      () =>
        Notification.open({
          title: "Welcome to Pixos",
          description: <Paragraph width={320} rows={3} />,
        }),
      ~~(Math.random() * 10000)
    );
  }

  async fetchFileLists() {
    // todo - fetch scripts and different files
    const resultPosts = await posts();
    const resultPages = await pages();

    //

    store.triggers = resultPosts;
    store.callbacks = resultPages;
  }

  async create(type, name = "untitled") {
    // New Post
    if (name === "") {
      name = "untitled";
    }
    const formattedName = `${name}.lua`;
    await save(formattedName, "", type); // Create Blank File
    await this.fetchFileLists();
    return formattedName;
  }

  async edit(script, type) {
    store.editScript = script;
    store.selectedType = type;
    // Prompt to Save if Changing
    if (store.selectedScript != script && store.isEditting && !store.isSaved) {
      this.saveChanges();
    } else {
      // Fetch Script & Store Content
      if (script && script !== "" && store.selectedScript != script) {
        this.fetchScript(script, type);
      }
    }
  }

  async fetchScript(script, type) {
    const fileResponse = await fetch("/content/" + type + "/" + script);
    if (fileResponse.ok) {
      let content = await fileResponse.text();
      store.selectedType = type;
      store.selectedScript = script;
      store.selectedContent = content;
      store.isEditting = true;
      store.isSaved = true;
    }
  }

  async saveChanges() {
    let result = await Swal.fire({
      title: "Do you want to save the changes?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: `Save`,
      denyButtonText: `Don't save`,
    });
    if (result.isConfirmed) {
      await save(store.selectedScript, store.selectedContent, store.selectedType);
      Swal.fire("Saved!", "", "success");
      await this.fetchScript(store.editCallback, store.selectedType);
    } else if (result.isDenied) {
      Swal.fire("Changes are not saved", "", "info");
      await this.fetchScript(store.editCallback,store.selectedType);
    }
  }

  async newFile() {
    let result = await Swal.fire({
      title: "Please enter the name of the new file",
      input: "text",
      inputPlaceholder: "untitled",
      showCancelButton: true,
      confirmButtonText: `Create`,
    });
    if (result.isConfirmed) {
      let newFile = await this.create(store.selectedType, result.value);
      Swal.fire("Created!", "", "success");
      await this.fetchScript(newFile);
    }
  }

  renderCallbacks() {
    return (
      <React.Fragment>
        <Row>
          <Container className="pixos-list-item">
            <List>
              {store.callbacks &&
                store.callbacks?.map((callback) => {
                  return (
                    <List.Item>
                      <label>
                        <a onClick={() => this.edit(callback, "callbacks")}>
                          {callback.replace(/\d+T\d+_/, "")}
                        </a>{" "}
                        <a
                          onClick={async () =>{
                            await navigator.clipboard.writeText(`/embed/callbacks/${callback.replace(".md","")}`);
                            await Swal.fire("Link Copied!", "", "success");
                          }}
                        >
                          <Icon icon="link"></Icon>
                        </a>
                      </label>
                    </List.Item>
                  );
                })}
            </List>
          </Container>
        </Row>
      </React.Fragment>
    );
  }

  renderTriggers() {
    return (
      <React.Fragment>
        <Row>
          <Container className="pixos-list-item">
            <List>
              {store.triggers &&
                store.triggers?.map((trigger) => {
                  return (
                    <List.Item>
                      <label>
                        <a onClick={() => this.edit(trigger, "triggers")}>
                          {trigger.replace(/\d+T\d+_/, "")}
                        </a>{" "}
                        <a
                            onClick={async () =>{
                              await navigator.clipboard.writeText(`/embed/triggers/${trigger.replace(".lua","")}`);
                              await Swal.fire("Link Copied!", "", "success");
                            }                          }
                        >
                          <Icon icon="link"></Icon>
                        </a>
                      </label>
                    </List.Item>
                  );
                })}
            </List>
          </Container>
        </Row>
      </React.Fragment>
    );
  }
  // PANELS & COMPONENTS
  renderPanel() {
    let content = store.selectedContent;
    return (
      <Panel style={{ width: "100%", maxWidth: "100vw" }}>
        <Content>
          <Row>
            <Col md={4}>
              <details open>
                <summary>
                  Scripts{" "}
                  <details>
                    <summary>
                      Triggers{" "}
                      <button
                        onClick={async () => {
                          store.selectedType = "trigger";
                          await this.newFile();
                        }}
                      >
                        + Add New Trigger
                      </button>
                    </summary>
                    {this.renderTriggers()}
                  </details>
                  <details>
                    <summary>
                      Callbacks{" "}
                      <button
                        onClick={async () => {
                          store.selectedType = "callback";
                          await this.newFile();
                        }}
                      >
                        + Add New Callback
                      </button>
                    </summary>
                    {this.renderCallbacks()}
                  </details>
                </summary>
              </details>
            </Col>
            <Col md={20}>
              {store.selectedScript && content !== null ? (
                <ScriptEdit content={content} />
              ) : (
                <NonIdealState
                  style={{ height: "87vh" }}
                  icon={"build"}
                  title="Getting Started"
                  description={"Please select a script to edit"}
                />
              )}
            </Col>
          </Row>
        </Content>
      </Panel>
    );
  }

  render() {
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "row",
          minHeight: "100vh",
        }}
      >
        <SideMenu
          activeKey={"1"}
          style={{ flex: 1, flexShrink: 1, flexGrow: 0 }}
        />
        <div style={{ display: "flex", flex: 1, flexDirection: "row" }}>
          <Container className="pixos-admin">
            <NavBar
              isAdmin={true}
              isLogin={false}
              renderBrand={this.renderClientSelect}
              renderBar={() => null}
              renderRight={() => null}
            />
            <Content style={{ marginTop: "3em" }}>{this.renderPanel()}</Content>
          </Container>
        </div>
      </div>
    );
  }
}

export default collect(Dashboard);
