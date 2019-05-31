<?php

namespace backend\controllers;

use Yii;
use backend\models\ElementSubType;
use backend\models\ElementSubTypeSearch;
use yii\filters\AccessControl;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * Element_sub_typeController implements the CRUD actions for ElementSubType model.
 */
class Element_sub_typeController extends Controller
{
    /**
     * {@inheritdoc}
     */
    public function behaviors()
    {
        return [
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'delete' => ['POST'],
                ],
            ],
            'access' => [
                'class' => AccessControl::className(),
                'only' => ['index','create','update','view','delete'],
                'rules' => [
                    [
                        'actions' => ['index','create','update','view','delete'],
                        'allow' => true,
                        'roles'=> ['Jefe de Proyecto'],
                    ],
                ],
            ],
        ];
    }

    /**
     * Lists all ElementSubType models.
     * @return mixed
     */
    public function actionIndex()
    {
        $searchModel = new ElementSubTypeSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single ElementSubType model.
     * @param integer $id
     * @return mixed
     * @throws NotFoundHttpException if the model cannot be found
     */
    public function actionView($id)
    {
        return $this->renderAjax('view', [
            'model' => $this->findModel($id),
        ]);
    }

    /**
     * Creates a new ElementSubType model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        $model = new ElementSubType();

        if ($model->load(Yii::$app->request->post())) {
            if($model->save()){
                return $model->name;
            } else {
                return "Error";
            }
        } else {
            return $this->renderAjax('create', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Updates an existing ElementSubType model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     * @throws NotFoundHttpException if the model cannot be found
     */
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);

        if ($model->load(Yii::$app->request->post())) {
            if($model->save()){
                return $model->name;
            } else {
                return "Error";
            }
        } else {
            return $this->renderAjax('update', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Deletes an existing ElementSubType model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     * @throws NotFoundHttpException if the model cannot be found
     */
    public function actionDelete($id)
    {
        $model = $this->findModel($id);
        $model->removed = true;
        if ($model->save())
            return $model->name;
        else
            return "Error";
    }

    /**
     * Finds the ElementSubType model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return ElementSubType the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = ElementSubType::findOne($id)) !== null) {
            return $model;
        }

        throw new NotFoundHttpException('La página pedida no existe.');
    }
}
