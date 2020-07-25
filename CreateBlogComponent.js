import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getCategories } from '../../actions/category';
import Loading from '../../components/loading/Loading';
import { useForm } from 'react-hook-form';
// import { Editor } from '@tinymce/tinymce-react';
import Router, { withRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { quillModules, quillFormats } from '../../helpers/quill';
import { createBlog } from '../../actions/blog';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
// import ReactQuill from 'react-quill';

// import { Editor, EditorState } from 'draft-js';

const CreateBlog = ({ router }) => {
	const [categories, setCategories] = useState([]);
	const { register, handleSubmit, errors, watch } = useForm(); // initialise the hook
	const [body, setBody] = useState('');
	const [values, setValues] = useState({
		loading: false,
		error: false,
		message: false,
		title: '',
		formData: '',
		language: 'English',
		photo: false,
	});

	const { loading, error, message, title, formData, language } = values;
	const [fd, setFd] = useState(false);

	const [checkedCat, setCheckedCat] = useState([]);

	const handleToggleCat = (c) => {
		// console.log(c);
		setValues({ ...values, error: false });
		const all = [...checkedCat];
		const checkedIndex = checkedCat.indexOf(c);
		if (checkedIndex === -1) {
			all.push(c);
		} else {
			all.splice(checkedIndex, 1);
		}
		setCheckedCat(all);
		formData.set('categories', all);
	};

	const initCategories = () => {
		getCategories()
			.then((data) => {
				if (data.error) {
					setValues({ ...values, loading: false, error: data.error, formData: new FormData() });
				} else {
					setValues({ ...values, loading: false, formData: new FormData() });
					setCategories(data.categories);
				}
			})
			.catch((err) => {
				setValues({ ...values, loading: false, error: err });
			});
	};

	useEffect(() => {
		setValues({ ...values, loading: true });
		initCategories();
	}, []);

	const handleEditorChange = (e) => {
		setBody(e);
		formData.set('description', e);
	};

	const handleChange = (name) => (e) => {
		const value = name === 'photo' ? e.target.files[0] : e.target.value;
		formData.set(name, value);
		setValues({ ...values, [name]: value, error: false, success: false });
	};

	const onSubmit = (data, event) => {
		event.preventDefault();
		setValues({ ...values, loading: true });
		createBlog(formData)
			.then((data) => {
				if (data.error) {
					setValues({ ...values, error: data.error, message: false, loading: false });
				} else {
					setValues({
						...values,
						message: data.message,
						loading: false,
						title: '',
						language: 'true',
						error: false,
						photo: false,
					});
					setTimeout(() => {
						window.location.reload(false);
					}, 3000);
					setBody('');
					// setCategories([]);
					// initCategories();
					// setCheckedCat([]);
				}
			})
			.catch((err) => {
				console.log(err);
				setValues({ ...values, error: err, loading: false, message: false });
			});
	};

	const BlogCreateForm = () => {
		return (
			<React.Fragment>
				<div className="form-group">
					<label htmlFor="title">Blog title</label>
					<input
						type="title"
						className="form-control"
						id="title"
						placeholder="New blog"
						name="title"
						value={title}
						onChange={handleChange('title')}
						ref={register({ required: true })}
						autoComplete="off"
						style={errors.title && { border: '1px solid red' }}
					/>
					<p className={`text-danger`} style={{ fontSize: '0.8rem' }}>
						{errors.title && 'Blog should have a title'}
					</p>
				</div>
				<div className="form-group">
					<label htmlFor="language">Blog Language</label>
					<select
						class="form-control"
						id="language"
						name="language"
						onChange={handleChange('language')}
						ref={register({ required: true, validate: (value) => value !== 'true' })}
						style={errors.language && { border: '1px solid red' }}
					>
						<option disabled selected value>
							{' '}
							-- select an option --{' '}
						</option>
						<option value="English">English</option>
						<option value="Hindi">Hindi</option>
					</select>
					<p className={`text-danger`} style={{ fontSize: '0.8rem' }}>
						{errors.language && 'Please select blog language'}
					</p>
				</div>
				<div className="form-group">
					<label htmlFor="photo">Blog featured image</label>
					<input
						type="file"
						className="form-control"
						id="photo"
						placeholder="New blog"
						name="photo"
						onChange={handleChange('photo')}
					/>
				</div>

				<ReactQuill
					value={body}
					modules={quillModules}
					formats={quillFormats}
					placeholder="Blog content"
					onChange={handleEditorChange}
				/>

				{/* causing some issues */}
				{/* <Editor
					apiKey="ozndtuq6djol52h5wlof5k8szgey09tqxj1xs2fki03qdhl4"
					initialValue=""
					branding="false"
					init={{
						height: 500,
						menubar: false,
						plugins: [
							'advlist autolink lists link image',
							'charmap print preview anchor help',
							'searchreplace visualblocks code',
							'insertdatetime media table paste wordcount',
						],
						toolbar:
							'undo redo | formatselect | bold italic | \
							alignleft aligncenter alignright | \
							bullist numlist outdent indent | media image | help ',
						image_uploadtab: true,
						image_title: true,
						images_upload_url: `http://localhost:8000/api/image/`,
						file_picker_types: 'file image media',
						image_advtab: true,
					}}
					onChange={handleEditorChange}
				/> */}
				{/* <Editor editorState={editorState} onChange={setEditorState} /> */}
			</React.Fragment>
		);
	};
	const showCategories = () => {
		if (categories) {
			return categories.map((c) => {
				return (
					<li key={c._id} className="list-unstyled text-capitalize">
						<input
							type="checkbox"
							className="mr-2"
							onChange={() => {
								handleToggleCat(c._id);
							}}
						/>
						<label className="form-check-label">{c.name}</label>
					</li>
				);
			});
		}
	};

	const showMessage = () => {
		return message && <div className="alert alert-success">{message}</div>;
	};

	const showErrors = () => {
		return error && <div className="alert alert-danger">{error}</div>;
	};

	return (
		<React.Fragment>
			{loading && <Loading />}
			<div className="container pt-3">
				{showMessage()}
				{showErrors()}
				<form onSubmit={handleSubmit(onSubmit)}>
					<button className="btn btn-outline-success my-3 mx-auto" type="submit">
						Publish Content
					</button>
					<div className="row">
						<div className="col-8">{BlogCreateForm()}</div>
						<div className="col-4">
							<h4>Categories </h4>
							<ul style={{ maxHeight: '200px', overflowY: 'auto' }}>{showCategories()}</ul>
						</div>
					</div>
				</form>
			</div>
		</React.Fragment>
	);
};

export default withRouter(CreateBlog);
