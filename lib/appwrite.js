import { Account, Avatars, Client, Databases, ID,Storage, Query } from 'react-native-appwrite';

export const config = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.byte.aora',
    projectId: '66d34c5c002322465872',
    databaseId: '66d432150011f44153e0',
    userCollectionId: '66d432630032f3cfea4f',
    videoCollectionId: '66d4329d002d8729b9a6',
    storageId: '66d4346c00094316998f'
};

const{
endpoint,
platform,
projectId,
databaseId,
userCollectionId,
videoCollectionId,
storageId
} = config

// Initialize Appwrite Client
const client = new Client()
.setEndpoint(endpoint) // Your Appwrite Endpoint
    .setProject(projectId)  // Your project ID
    .setPlatform(platform); // Your application ID or bundle ID

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);



// Function to create a new user account and log in
export async function createUser(email, password, username) {
    try {
        const newAccount = await account.create(ID.unique(), email, password, username);
        if (!newAccount) throw new Error('Failed to create account');

        const avatarUrl = avatars.getInitials(username);

        // Sign in the user after account creation
        const session = await signIn(email, password);

        const newUser = await databases.createDocument(databaseId, userCollectionId, ID.unique(), {
            accountId: newAccount.$id,
            Email: email,
            username: username,
            Avatar: avatarUrl
        });

        return newUser;
    } catch (error) {
        console.error('Error creating user:', error.message);
        throw new Error(error.message);
    }
}
const deleteSession = async() => {
  try {
    const activeSessions = await account.listSessions();
    if (activeSessions.total > 0) {
      await account.deleteSession("current")    
    }
  } catch (error) {
    console.log("No session available.");
  }
};

export const signIn = async (email, password) => {
  try {
    await deleteSession();
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    console.log("Error occured");
    throw new Error(error);
  }
};

export const getCurrentUser = async () =>{
    try {
        const currentAccount = await account.get();

        if(!currentAccount) throw error;

        const currentUser = await databases.listDocuments(
            databaseId,
            userCollectionId,
            [Query.equal('accountId',currentAccount.$id)]
        )

        if(!currentUser) throw Error;
        return currentUser.documents[0]

    } catch (error) {
        console.log(error)
    }
}

export const getAllPosts = async () =>{
  try{
    const posts = await databases.listDocuments(
     databaseId,
    videoCollectionId,
    [Query.orderDesc('$createdAt')]

    )

    return posts.documents;
  }catch(error){
    throw new Error(error);
  }
}


export const getLatestPosts = async () =>{
  try{
    const posts = await databases.listDocuments(
     databaseId,
    videoCollectionId,
    [Query.orderDesc('$createdAt',Query.limit(7))]
    )

    return posts.documents;
  }catch(error){
    throw new Error(error);
  }
}

export const SeachPosts = async (query) =>{
  try{
    const posts = await databases.listDocuments(
     databaseId,
    videoCollectionId,
    [Query.search('Title',query)]
    )

    return posts.documents;
  }catch(error){
    throw new Error(error);
  }
}
export const GetUserPosts = async (userId) =>{
  try{
    const posts = await databases.listDocuments(
     databaseId,
    videoCollectionId,
    [Query.equal('creator',userId)]
    )

    return posts.documents;
  }catch(error){
    throw new Error(error);
  }
}

export const signOut = async () =>{
  try {
    const session = await account.deleteSession('current')
   return session
  } catch (error) {
    throw new Error(error)
  }
}

export const getFilePreview = async (fileId,type) =>{
  let fileUrl;

  try {
    if(type==='video'){
      fileUrl = storage.getFileView(storageId,fileId)
    }else if(type ==='image'){
      fileUrl = storage.getFilePreview(storageId,fileId,2000,2000,'top,100')
    }else{
      throw new Error('Invalid file type')
    }

    if(!fileUrl) throw Error;

    return fileUrl 
  } catch (error) {
    throw new Error(error)
  }
}

export const uploadFile = async(file,type)=>{
  if(!file) return;

  const asset = {
    name:file.fileName,
    type:file.mimeType,
    size:file.fileSize,
    uri:file.uri,
  };

  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );
    const fileUrl = await getFilePreview(uploadedFile.$id,type)
      return fileUrl
  } catch (error) {
    throw new Error(error)
  }
}

export const createVideo = async (form) =>{
  try {
    const [thumbnailUrl,videourl] = await Promise.all([
      uploadFile(form.thumbnail,'image'),
      uploadFile(form.video,'video')
    ])

    const newPost = await databases.createDocument(
      databaseId,videoCollectionId,ID.unique(),{
        Title:form.title,
        Thumbnail:thumbnailUrl,
        Video:videourl,
        Prompt:form.prompt,
        creator:form.userId
      }
    )

    return newPost
  } catch (error) {
    throw new Error(error)
  }
}
